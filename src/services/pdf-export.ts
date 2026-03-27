/**
 * PDF Export service — src/services/pdf-export.ts
 *
 * Generates a full A4 portrait engineering report from the current
 * calculation run.  All text is rendered via the jsPDF text API for
 * crispness.  The cross-section SVG is captured with html2canvas (with
 * an SVG-serialisation fallback for environments where html2canvas
 * struggles with CSS variables / web fonts).
 *
 * Trigger: "Export PDF" button in InputPanel.tsx (enabled when results exist).
 */

import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import type { DesignInputs } from '@/core/types/inputs'
import type { CalculationResults } from '@/core/types/results'
import type { ValidationSummary } from '@/core/types/validation'

// ─────────────────────────────────────────────────────────────────────────────
// Page geometry  (A4 portrait, all values in mm)
// ─────────────────────────────────────────────────────────────────────────────
const PW   = 210          // page width
const PH   = 297          // page height
const ML   = 18           // margin left
const MR   = 18           // margin right
const MT   = 22           // margin top (first content line after header bar)
const MB   = 22           // margin bottom (footer lives here)
const CW   = PW - ML - MR // usable content width = 174 mm

// ─────────────────────────────────────────────────────────────────────────────
// Colour helpers  (PDF uses white bg — dark, legible palette)
// ─────────────────────────────────────────────────────────────────────────────
type RGB = [number, number, number]

function h(hex: string): RGB {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

const P = {
  white:   h('#ffffff'),
  black:   h('#111827'),
  dark:    h('#1f2937'),
  muted:   h('#6b7280'),
  light:   h('#d1d5db'),
  accent:  h('#16b36e'),           // green — matches design system
  amber:   h('#b45309'),           // darkened for white-bg legibility
  danger:  h('#dc2626'),
  border:  h('#e5e7eb'),
  stripe:  h('#f9fafb'),
  tHead:   h('#f3f4f6'),
  yBg:     h('#fffbeb'),           // amber row highlight
  gLight:  h('#d1fae5'),           // light green (header subtitle)
} as const

const fc = (doc: jsPDF, c: RGB) => doc.setFillColor(c[0], c[1], c[2])
const sc = (doc: Doc, c: RGB) => doc.setDrawColor(c[0], c[1], c[2])
const tc = (doc: Doc, c: RGB) => doc.setTextColor(c[0], c[1], c[2])

type Doc = jsPDF

// ─────────────────────────────────────────────────────────────────────────────
// Manning's n → material name lookup
// ─────────────────────────────────────────────────────────────────────────────
const MANNINGS_LABEL: Record<number, string> = {
  0.013: 'Smooth concrete',
  0.015: 'Finished concrete',
  0.017: 'Unfinished concrete',
  0.022: 'Excavated earth, clean',
  0.025: 'Gravel',
  0.030: 'Natural channel',
}

// ─────────────────────────────────────────────────────────────────────────────
// Return period → AEP %
// ─────────────────────────────────────────────────────────────────────────────
const AEP: Record<number, number> = { 2: 50, 5: 20, 10: 10, 25: 4, 50: 2, 100: 1 }

// ─────────────────────────────────────────────────────────────────────────────
// Pagination helper
// ─────────────────────────────────────────────────────────────────────────────
function checkBreak(doc: Doc, y: number, needed: number): number {
  if (y + needed > PH - MB) {
    doc.addPage()
    return MT
  }
  return y
}

// ─────────────────────────────────────────────────────────────────────────────
// Section header  (green left accent bar + bold uppercase title)
// ─────────────────────────────────────────────────────────────────────────────
function sectionHeader(doc: Doc, title: string, y: number): number {
  y = checkBreak(doc, y, 14)
  fc(doc, P.accent)
  doc.rect(ML, y, 3, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  tc(doc, P.dark)
  doc.text(title.toUpperCase(), ML + 6, y + 5)
  return y + 12
}

// ─────────────────────────────────────────────────────────────────────────────
// Table renderer  (no jspdf-autotable — pure primitives)
// ─────────────────────────────────────────────────────────────────────────────
interface ColDef {
  label: string
  width: number
  align?: 'left' | 'right' | 'center'
}

interface RowDef {
  cells: string[]
  highlight?: 'amber' | null
  cellColors?: (RGB | null)[]
}

function drawTable(
  doc: Doc,
  cols: ColDef[],
  rows: RowDef[],
  y: number,
  rowH = 6.5,
): number {
  const HEAD_H = 7.5

  // ── Header ────────────────────────────────────────────────────────────────
  fc(doc, P.tHead)
  sc(doc, P.border)
  doc.setLineWidth(0.15)
  doc.rect(ML, y, CW, HEAD_H, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  tc(doc, P.muted)

  let cx = ML
  cols.forEach((col) => {
    const align = col.align ?? 'left'
    const tx =
      align === 'right'  ? cx + col.width - 2.5 :
      align === 'center' ? cx + col.width / 2   :
                           cx + 3
    doc.text(col.label.toUpperCase(), tx, y + HEAD_H / 2 + 2.5, { align })
    cx += col.width
  })

  y += HEAD_H

  // ── Rows ─────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)

  rows.forEach((row, ri) => {
    y = checkBreak(doc, y, rowH)

    // background
    if (row.highlight === 'amber') {
      fc(doc, P.yBg)
    } else if (ri % 2 === 1) {
      fc(doc, P.stripe)
    } else {
      fc(doc, P.white)
    }
    sc(doc, P.border)
    doc.setLineWidth(0.1)
    doc.rect(ML, y, CW, rowH, 'FD')

    // cells
    let cx2 = ML
    cols.forEach((col, ci) => {
      const cell  = row.cells[ci] ?? ''
      const color = row.cellColors?.[ci] ?? P.dark
      tc(doc, color)

      const align = col.align ?? 'left'
      const tx =
        align === 'right'  ? cx2 + col.width - 2.5 :
        align === 'center' ? cx2 + col.width / 2   :
                             cx2 + 3
      doc.text(cell, tx, y + rowH / 2 + 2.5, { align })
      cx2 += col.width
    })

    y += rowH
  })

  return y
}

// ─────────────────────────────────────────────────────────────────────────────
// 2-column KV grid  (for Hydrology + Channel primary results)
//   label (7 pt muted) → large value (13 pt accent) + unit (8 pt muted)
//   sub-label (7 pt muted) below
// ─────────────────────────────────────────────────────────────────────────────
interface KVItem {
  label: string
  value: string   // numeric portion only, e.g. "17.95"
  unit?: string   // e.g. "min"
  sub?: string    // e.g. "Kirpich (1940)"
  valueColor?: RGB
}

function kv2Grid(doc: Doc, items: KVItem[], y: number): number {
  const colW  = CW / 2   // 87 mm per column
  const itemH = 17        // mm per grid row

  for (let i = 0; i < items.length; i += 2) {
    y = checkBreak(doc, y, itemH)

    for (let col = 0; col <= 1; col++) {
      const item = items[i + col]
      if (!item) continue

      const x     = ML + col * colW
      const color = item.valueColor ?? P.accent

      // label
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      tc(doc, P.muted)
      doc.text(item.label.toUpperCase(), x + 3, y + 4.5)

      // value (large)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      tc(doc, color)
      doc.text(item.value, x + 3, y + 12)

      // unit (inline after value)
      if (item.unit) {
        const valW = doc.getTextWidth(item.value)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        tc(doc, P.muted)
        doc.text(item.unit, x + 3 + valW + 1.5, y + 11)
      }

      // sub-label
      if (item.sub) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        tc(doc, P.muted)
        doc.text(item.sub, x + 3, y + 16.5)
      }
    }

    y += itemH
  }

  return y + 2
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer  (drawn after all pages are generated, then doc.setPage loops back)
// ─────────────────────────────────────────────────────────────────────────────
function drawFooter(doc: Doc, pageNum: number, total: number): void {
  const fy = PH - 10
  doc.setLineWidth(0.2)
  sc(doc, P.light)
  doc.line(ML, fy - 3, PW - MR, fy - 3)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  tc(doc, P.light)
  doc.text(
    'Drainage Design Tool  ·  Urban Hydraulic & Hydrological Analysis  ·  Uganda / East Africa',
    ML,
    fy + 1,
  )
  doc.text(`Page ${pageNum} of ${total}`, PW - MR, fy + 1, { align: 'right' })
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG diagram capture
//   Primary: html2canvas (honours the spec)
//   Fallback: XMLSerializer → data URL → Canvas (avoids CORS / font issues)
// ─────────────────────────────────────────────────────────────────────────────
async function captureSVGDiagram(): Promise<string | null> {
  const el = document.getElementById('channel-cross-section-svg')
  if (!el) return null

  // Primary — html2canvas
  try {
    const canvas = await html2canvas(el as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    })
    return canvas.toDataURL('image/png')
  } catch { /* fall through */ }

  // Fallback — SVG serialisation
  try {
    const svgStr = new XMLSerializer().serializeToString(el)
    const src    = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr)
    const img    = new Image()

    await new Promise<void>((resolve, reject) => {
      img.onload  = () => resolve()
      img.onerror = () => reject(new Error('SVG image load failed'))
      img.src = src
    })

    const rect = el.getBoundingClientRect()
    const W    = rect.width  > 0 ? rect.width  : 580
    const H    = rect.height > 0 ? rect.height : 340
    const scale = 2

    const canvas = document.createElement('canvas')
    canvas.width  = W * scale
    canvas.height = H * scale

    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/png')
  } catch { /* fall through */ }

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
export async function exportToPDF(
  inputs: DesignInputs,
  results: CalculationResults,
  validationSummary: ValidationSummary | null,
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const { hydrology, idfTable, channelDesign } = results
  const { catchment, rainfall, channel }       = inputs

  const aep      = AEP[catchment.returnPeriod] ?? '—'
  const dateStr  = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  let y = 0

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ══════════════════════════════════════════════════════════════════════════

  // ── Green header bar ───────────────────────────────────────────────────────
  fc(doc, P.accent)
  doc.rect(0, 0, PW, 18, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  tc(doc, P.white)
  doc.text('DRAINAGE DESIGN TOOL', ML, 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  tc(doc, P.gLight)
  doc.text(
    'Urban Hydraulic & Hydrological Analysis  ·  Uganda / East Africa',
    ML, 15,
  )

  // Date + return period (right-aligned in the bar)
  tc(doc, P.white)
  doc.setFontSize(7.5)
  doc.text(dateStr, PW - MR, 10, { align: 'right' })
  doc.text(
    `${catchment.returnPeriod}-year storm (AEP ${aep}%)`,
    PW - MR, 15, { align: 'right' },
  )

  y = MT + 4

  // ── Design Inputs ─────────────────────────────────────────────────────────
  y = sectionHeader(doc, 'Design Inputs', y)

  const inputRows: RowDef[] = [
    { cells: ['Catchment Area',             `${catchment.area} ha`],               cellColors: [P.muted, P.dark] },
    { cells: ['Flow Path Length',            `${catchment.flowPathLength} m`],      cellColors: [P.muted, P.dark] },
    { cells: ['Channel Slope',               `${catchment.slope} m/m`],             cellColors: [P.muted, P.dark] },
    { cells: ['Runoff Coefficient (C)',       `${catchment.runoffCoefficient}`],     cellColors: [P.muted, P.dark] },
    { cells: ['Return Period',               `${catchment.returnPeriod}-year storm (AEP ${aep}%)`], cellColors: [P.muted, P.dark] },
    { cells: ['Mean Annual Max Rainfall (μ)', `${rainfall.meanAnnualMaxRainfall} mm`], cellColors: [P.muted, P.dark] },
    { cells: ['Std Deviation (σ)',            `${rainfall.stdDeviation} mm`],        cellColors: [P.muted, P.dark] },
  ]

  if (rainfall.stormDurationOverride && rainfall.stormDurationOverride > 0) {
    inputRows.push({
      cells: ['Storm Duration Override', `${rainfall.stormDurationOverride} min`],
      cellColors: [P.muted, P.dark],
    })
  }

  const inputCols: ColDef[] = [
    { label: 'Catchment & Rainfall Parameter', width: 120 },
    { label: 'Value',                          width:  54, align: 'right' },
  ]
  y = drawTable(doc, inputCols, inputRows, y)
  y += 3

  const chanCols: ColDef[] = [
    { label: 'Channel Parameter', width: 120 },
    { label: 'Value',             width:  54, align: 'right' },
  ]
  y = drawTable(doc, chanCols, [
    {
      cells: ["Manning's n", `${channel.manningsN}  —  ${MANNINGS_LABEL[channel.manningsN] ?? ''}`],
      cellColors: [P.muted, P.dark],
    },
    { cells: ['Side Slope (z)', `${channel.sideSlope} : 1  (H : V)`], cellColors: [P.muted, P.dark] },
    { cells: ['Channel Slope',  `${channel.channelSlope} m/m`],        cellColors: [P.muted, P.dark] },
  ], y)

  y += 5

  // ── Hydrology Results ─────────────────────────────────────────────────────
  y = sectionHeader(doc, 'Hydrology Results', y)

  y = kv2Grid(doc, [
    {
      label: 'Time of Concentration',
      value: hydrology.timeOfConcentration.toFixed(2),
      unit:  'min',
      sub:   'Kirpich (1940)',
    },
    {
      label: 'Design Rainfall Depth (XT)',
      value: hydrology.designRainfallDepth.toFixed(2),
      unit:  'mm',
      sub:   'Gumbel EV-I',
    },
    {
      label: 'Design Intensity (i)',
      value: hydrology.designIntensity.toFixed(2),
      unit:  'mm/hr',
      sub:   `at ${hydrology.designDuration.toFixed(1)} min`,
    },
    {
      label: 'Peak Discharge (Q)',
      value: hydrology.peakDischarge.toFixed(4),
      unit:  'm³/s',
      sub:   'Rational Method',
    },
  ], y)

  y += 4

  // ── IDF Table ─────────────────────────────────────────────────────────────
  y = sectionHeader(doc, 'IDF Table — Rainfall Intensity vs Duration', y)

  const idfCols: ColDef[] = [
    { label: 'Duration',          width: 100 },
    { label: 'Intensity (mm/hr)', width:  74, align: 'right' },
  ]

  y = drawTable(doc, idfCols, idfTable.map((row) => {
    const durLabel =
      row.duration >= 60
        ? `${row.duration} min  (${(row.duration / 60).toFixed(0)}h)${row.isDesignDuration ? '   ← design duration' : ''}`
        : `${row.duration} min${row.isDesignDuration ? '   ← design duration' : ''}`

    return {
      cells:      [durLabel, row.intensity.toFixed(2)],
      highlight:  row.isDesignDuration ? 'amber' : null,
      cellColors: [
        row.isDesignDuration ? P.amber : P.dark,
        row.isDesignDuration ? P.amber : P.accent,
      ],
    }
  }), y)

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2  — Cross-section + Channel design
  // ══════════════════════════════════════════════════════════════════════════
  y += 6
  y = checkBreak(doc, y, 80)

  // ── Cross-Section Diagram ─────────────────────────────────────────────────
  y = sectionHeader(doc, 'Channel Cross-Section Diagram', y)

  const imgData = await captureSVGDiagram()
  if (imgData) {
    // Compute height preserving aspect ratio, capped at 68 mm
    const tmpImg = new Image()
    tmpImg.src = imgData
    const nativeH = tmpImg.naturalHeight || 340
    const nativeW = tmpImg.naturalWidth  || 580
    const imgH    = Math.min((nativeH / nativeW) * CW, 68)

    doc.addImage(imgData, 'PNG', ML, y, CW, imgH)
    y += imgH + 5
  } else {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    tc(doc, P.muted)
    doc.text('[Cross-section diagram not available — open chart in browser before exporting]', ML, y + 5)
    y += 14
  }

  y = checkBreak(doc, y, 20)

  // ── Channel Design Results ────────────────────────────────────────────────
  y = sectionHeader(doc, 'Channel Design Results', y)

  // Manning's n subtitle
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  tc(doc, P.muted)
  doc.text(
    `Manning's n = ${channelDesign.manningsN}  —  ${MANNINGS_LABEL[channelDesign.manningsN] ?? ''}`,
    ML, y,
  )
  y += 6

  // Primary 2×3 grid
  y = kv2Grid(doc, [
    { label: 'Flow Depth (D)',      value: channelDesign.flowDepth.toFixed(3),    unit: 'm'   },
    { label: 'Base Width (B)',       value: channelDesign.baseWidth.toFixed(3),    unit: 'm'   },
    { label: 'Velocity (V)',         value: channelDesign.velocity.toFixed(3),     unit: 'm/s' },
    { label: 'Froude Number (Fr)',   value: channelDesign.froudeNumber.toFixed(3), unit: ''    },
    { label: 'Freeboard',            value: channelDesign.freeboard.toFixed(2),    unit: 'm'   },
    { label: 'Total Depth (H)',      value: channelDesign.totalDepth.toFixed(3),   unit: 'm'   },
  ], y)

  y += 3

  // Hydraulic geometry table
  y = drawTable(doc, [
    { label: 'Hydraulic Geometry', width: 100 },
    { label: 'Value',              width:  74, align: 'right' },
  ], [
    { cells: ['Flow Area',         `${channelDesign.flowArea.toFixed(4)} m²`],  cellColors: [P.muted, P.dark] },
    { cells: ['Top Width',         `${channelDesign.topWidth.toFixed(3)} m`],   cellColors: [P.muted, P.dark] },
    { cells: ['Wetted Perimeter',  `${channelDesign.wettedPerimeter.toFixed(3)} m`], cellColors: [P.muted, P.dark] },
    { cells: ['Hydraulic Radius',  `${channelDesign.hydraulicRadius.toFixed(4)} m`], cellColors: [P.muted, P.dark] },
  ], y)

  y += 3

  // Safety checks table
  const regimeColor =
    channelDesign.flowRegime === 'subcritical'   ? P.accent :
    channelDesign.flowRegime === 'supercritical' ? P.danger : P.amber

  const velColor =
    channelDesign.velocityStatus === 'acceptable'       ? P.accent :
    channelDesign.velocityStatus === 'erosion_risk'     ? P.danger : P.amber

  y = drawTable(doc, [
    { label: 'Safety Check', width: 100 },
    { label: 'Status',       width:  74, align: 'right' },
  ], [
    {
      cells: [
        'Flow Regime',
        `${channelDesign.flowRegime.replace(/_/g, ' ').toUpperCase()}  (Fr = ${channelDesign.froudeNumber.toFixed(3)})`,
      ],
      cellColors: [P.muted, regimeColor],
    },
    {
      cells: [
        'Velocity Check',
        `${channelDesign.velocityStatus.replace(/_/g, ' ').toUpperCase()}  (V = ${channelDesign.velocity.toFixed(3)} m/s)`,
      ],
      cellColors: [P.muted, velColor],
    },
    {
      cells: [
        'Freeboard Rule',
        `Q = ${hydrology.peakDischarge.toFixed(4)} m³/s  →  ${channelDesign.freeboard.toFixed(2)} m required`,
      ],
      cellColors: [P.muted, P.dark],
    },
  ], y)

  // ── Validation ────────────────────────────────────────────────────────────
  if (validationSummary && validationSummary.results.length > 0) {
    y += 6
    y = checkBreak(doc, y, 20)
    y = sectionHeader(doc, 'Validation — Manual vs Automated Results', y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    tc(doc, P.muted)
    doc.text(
      `${validationSummary.validatedCount} of ${validationSummary.totalEntered} parameter${validationSummary.totalEntered !== 1 ? 's' : ''} within ±10% tolerance`,
      ML, y,
    )
    y += 5

    y = drawTable(doc, [
      { label: 'Parameter',  width: 46 },
      { label: 'Automated', width: 30, align: 'right' },
      { label: 'Manual',     width: 30, align: 'right' },
      { label: '% Diff',     width: 28, align: 'right' },
      { label: 'Status',     width: 40, align: 'center' },
    ], validationSummary.results.map((r) => {
      const dp          = r.unit === 'm³/s' ? 4 : r.unit === 'mm/hr' ? 2 : 3
      const statusColor = r.status === 'validated' ? P.accent : P.danger
      return {
        cells: [
          `${r.label} (${r.unit})`,
          r.automatedValue.toFixed(dp),
          r.manualValue.toFixed(dp),
          `${r.percentageDifference.toFixed(2)}%`,
          r.status === 'validated' ? '✓ VALIDATED' : '✗ CHECK',
        ],
        cellColors: [P.dark, P.accent, P.dark, statusColor, statusColor],
      }
    }), y)
  }

  // ── Footers (all pages) ───────────────────────────────────────────────────
    const total = doc.getNumberOfPages()
    for (let p = 1; p <= total; p++) {
        doc.setPage(p)
        drawFooter(doc, p, total)
    }

  // ── Save file ─────────────────────────────────────────────────────────────
  const rawName  = inputs.sessionName?.trim() || 'drainage-design'
  const filename = rawName.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-report.pdf'
  doc.save(filename)
}