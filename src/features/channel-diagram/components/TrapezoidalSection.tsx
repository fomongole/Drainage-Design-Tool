import { Card } from '@/components/ui/Card'
import type { CrossSectionGeometry } from '@/core/types/results'

interface Props {
  crossSection: CrossSectionGeometry
}

export function TrapezoidalSection({ crossSection }: Props) {
  const { baseWidth, flowDepth, freeboard, sideSlope, totalDepth } = crossSection

  // ── SVG viewport ────────────────────────────────────────────────────────
  const W = 580
  const H = 340
  const pad = { top: 48, bottom: 56, left: 110, right: 90 }

  const drawW = W - pad.left - pad.right   // 380
  const drawH = H - pad.top - pad.bottom   // 236

  // ── Scale: fit the widest real dimension into the draw area ────────────
  const realWidth  = baseWidth + 2 * sideSlope * totalDepth   // channel top width
  const realHeight = totalDepth

  const scaleX = drawW / realWidth
  const scaleY = drawH / realHeight
  // Use uniform scale so angles look correct; pick the tighter axis
  const scale = Math.min(scaleX, scaleY)

  // Calculate how tall the scaled drawing actually is
  const renderedH = realHeight * scale

  // Origin: centre horizontally, and vertically center to eliminate dead space at the top
  const ox = pad.left + drawW / 2
  const oy = pad.top + drawH - ((drawH - renderedH) / 2)

  // ── Coordinate helper (real → SVG, y flipped) ─────────────────────────
  const pt = (rx: number, ry: number) => ({
    x: ox + rx * scale,
    y: oy - ry * scale,
  })

  // ── Key points ─────────────────────────────────────────────────────────
  const bL  = pt(-baseWidth / 2, 0)                                      // bottom-left
  const bR  = pt( baseWidth / 2, 0)                                      // bottom-right
  const wL  = pt(-baseWidth / 2 - sideSlope * flowDepth,  flowDepth)     // water-surface left
  const wR  = pt( baseWidth / 2 + sideSlope * flowDepth,  flowDepth)     // water-surface right
  const tL  = pt(-baseWidth / 2 - sideSlope * totalDepth, totalDepth)    // top-left
  const tR  = pt( baseWidth / 2 + sideSlope * totalDepth, totalDepth)    // top-right

  // ── Derived y positions ────────────────────────────────────────────────
  const bottomY  = bL.y
  const waterY   = wL.y
  const topY     = tL.y

  // ── Design tokens (inline — SVG renders outside Tailwind scope) ────────
  const C = {
    green:    '#16b36e',
    blue:     '#3b82f6',
    amber:    '#f59e0b',
    muted:    '#8b8fa8',
    border:   '#2a2d3e',
  }

  // ── Polygon point strings ──────────────────────────────────────────────
  const waterPts     = `${bL.x},${bottomY} ${bR.x},${bottomY} ${wR.x},${waterY} ${wL.x},${waterY}`
  const freeboardPts = `${wL.x},${waterY} ${wR.x},${waterY} ${tR.x},${topY} ${tL.x},${topY}`
  const wallPts      = `${tL.x},${topY} ${bL.x},${bottomY} ${bR.x},${bottomY} ${tR.x},${topY}`

  // ── Dimension brace helpers ────────────────────────────────────────────
  // Horizontal brace: tick-line-tick below a given y
  function hBrace(x1: number, x2: number, y: number, tickH = 6) {
    return (
      <>
        <line x1={x1} y1={y - tickH} x2={x1} y2={y + tickH} stroke={C.muted} strokeWidth="1" />
        <line x1={x2} y1={y - tickH} x2={x2} y2={y + tickH} stroke={C.muted} strokeWidth="1" />
        <line x1={x1} y1={y}         x2={x2} y2={y}         stroke={C.muted} strokeWidth="1" />
      </>
    )
  }

  // Vertical brace: tick-line-tick to the left/right of a given x
  function vBrace(x: number, y1: number, y2: number, color: string, tickW = 6) {
    return (
      <>
        <line x1={x - tickW} y1={y1} x2={x + tickW} y2={y1} stroke={color} strokeWidth="1" />
        <line x1={x - tickW} y1={y2} x2={x + tickW} y2={y2} stroke={color} strokeWidth="1" />
        <line x1={x}         y1={y1} x2={x}         y2={y2} stroke={color} strokeWidth="1" />
      </>
    )
  }

  return (
    <Card
      title="Channel Cross-Section"
      subtitle="Trapezoidal section — to scale — flow depth + freeboard zone"
    >
      {/* ↓ id added for Phase 11 PDF export (html2canvas capture target) */}
      <svg
        id="channel-cross-section-svg"
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block' }}
        aria-label="Trapezoidal channel cross-section diagram"
      >

        {/* ── Freeboard zone fill ──────────────────────────────────────── */}
        <polygon points={freeboardPts} fill="rgba(245,158,11,0.08)" stroke="none" />

        {/* ── Water fill ───────────────────────────────────────────────── */}
        <polygon points={waterPts} fill="rgba(59,130,246,0.13)" stroke="none" />

        {/* ── Channel walls (green) ────────────────────────────────────── */}
        <polyline
          points={wallPts}
          fill="none"
          stroke={C.green}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* ── Top wall cap ─────────────────────────────────────────────── */}
        <line x1={tL.x} y1={topY} x2={tR.x} y2={topY}
          stroke={C.green} strokeWidth="2.5" />

        {/* ── Ground extensions ─────────────────────────────────────────── */}
        <line x1={tL.x - 20} y1={topY} x2={tL.x} y2={topY}
          stroke={C.border} strokeWidth="1.5" strokeDasharray="4 2" />
        <line x1={tR.x} y1={topY} x2={tR.x + 20} y2={topY}
          stroke={C.border} strokeWidth="1.5" strokeDasharray="4 2" />

        {/* ── Water surface (blue dashed) ───────────────────────────────── */}
        <line x1={wL.x} y1={waterY} x2={wR.x} y2={waterY}
          stroke={C.blue} strokeWidth="1.5" strokeDasharray="7 3" />

        {/* ══════════════ DIMENSION LABELS ════════════════════════════ */}

        {/* ── B — base width (below bottom) ──────────────────────────── */}
        {hBrace(bL.x, bR.x, bottomY + 22)}
        <text
          x={(bL.x + bR.x) / 2}
          y={bottomY + 40}
          textAnchor="middle"
          fill={C.muted}
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          B = {baseWidth.toFixed(3)} m
        </text>

        {/* ── D — flow depth (left of channel) ───────────────────────── */}
        {vBrace(tL.x - 22, waterY, bottomY, C.blue)}
        <text
          x={tL.x - 30}
          y={(waterY + bottomY) / 2 + 4}
          textAnchor="end"
          fill={C.blue}
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          D = {flowDepth.toFixed(3)} m
        </text>

        {/* ── Freeboard (left of channel, above D brace) ─────────────── */}
        {vBrace(tL.x - 22, topY, waterY, C.amber)}
        <text
          x={tL.x - 30}
          y={(topY + waterY) / 2 + 4}
          textAnchor="end"
          fill={C.amber}
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          fb = {freeboard.toFixed(2)} m
        </text>

        {/* ── Total depth brace (right of channel) ───────────────────── */}
        {vBrace(tR.x + 22, topY, bottomY, C.muted)}
        <text
          x={tR.x + 30}
          y={(topY + bottomY) / 2 + 4}
          textAnchor="start"
          fill={C.muted}
          fontSize="11"
          fontFamily="var(--font-mono)"
        >
          H = {totalDepth.toFixed(3)} m
        </text>

        {/* ── Water surface label ─────────────────────────────────────── */}
        <text
          x={(wL.x + wR.x) / 2}
          y={waterY - 8}
          textAnchor="middle"
          fill={C.blue}
          fontSize="10"
          fontFamily="var(--font-sans)"
          opacity="0.9"
        >
          ▿ water surface
        </text>

        {/* ── Freeboard zone label (only if tall enough) ─────────────── */}
        {(waterY - topY) > 20 && (
          <text
            x={(tL.x + tR.x) / 2}
            y={(topY + waterY) / 2 + 4}
            textAnchor="middle"
            fill={C.amber}
            fontSize="10"
            fontFamily="var(--font-sans)"
            opacity="0.7"
          >
            freeboard
          </text>
        )}

        {/* ── z — side slope label on right wall ─────────────────────── */}
        {sideSlope > 0 && (() => {
          // mid-point of right wall in real coords
          const midRx = baseWidth / 2 + sideSlope * (totalDepth / 2)
          const midRy = totalDepth / 2
          const mid   = pt(midRx, midRy)
          // SVG angle of the right wall (from bottom-right to top-right)
          const angle = Math.atan2(topY - bottomY, tR.x - bR.x) * (180 / Math.PI)
          return (
            <text
              x={mid.x + 10}
              y={mid.y + 4}
              textAnchor="start"
              fill={C.muted}
              fontSize="10"
              fontFamily="var(--font-mono)"
              transform={`rotate(${angle}, ${mid.x + 10}, ${mid.y + 4})`}
            >
              z : 1 = {sideSlope} : 1
            </text>
          )
        })()}

        {/* ── Top width label (above top wall) ───────────────────────── */}
        <text
          x={(tL.x + tR.x) / 2}
          y={topY - 10}
          textAnchor="middle"
          fill={C.muted}
          fontSize="10"
          fontFamily="var(--font-mono)"
        >
          T = {(baseWidth + 2 * sideSlope * totalDepth).toFixed(3)} m
        </text>

      </svg>

      {/* ── Legend row ──────────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          marginTop: '1rem',
          paddingTop: '0.875rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.25rem 1.5rem',
          fontSize: '0.7rem',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {[
          { swatch: 'rgba(22,179,110,1)',    label: 'Channel walls' },
          { swatch: 'rgba(59,130,246,0.9)',  label: 'Water surface', dashed: true },
          { swatch: 'rgba(59,130,246,0.2)',  label: 'Flow area' },
          { swatch: 'rgba(245,158,11,0.3)',  label: 'Freeboard zone' },
        ].map(({ swatch, label, dashed }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              display: 'inline-block',
              width: dashed ? 20 : 12,
              height: dashed ? 0 : 10,
              borderRadius: dashed ? 0 : 2,
              background: dashed ? 'transparent' : swatch,
              borderTop: dashed ? `2px dashed ${swatch}` : 'none',
              flexShrink: 0,
            }} />
            {label}
          </span>
        ))}
      </div>
    </Card>
  )
}