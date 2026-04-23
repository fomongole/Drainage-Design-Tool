import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { TRRLResults } from '@/core/types/results'
import type { HydrologyResults } from '@/core/types/results'
import { fmt } from '../formatters'

interface Props {
  trrl: TRRLResults
  hydrology: HydrologyResults
}

export function TRRLPanel({ trrl, hydrology }: Props) {
  const isOverestimate = trrl.vsRationalPercent > 0
  const absDiff = Math.abs(trrl.vsRationalPercent)

  return (
    <Card
      title="TRRL East African Flood Model"
      subtitle={`Road Note 5 (1976) · Cₐ = ${trrl.ca} · Area = ${trrl.areaKm2.toFixed(2)} km²`}
    >
      {/* ── Convergence badge ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5">
        <Badge variant={trrl.converged ? 'validated' : 'warning'}>
          {trrl.converged
            ? `Converged in ${trrl.iterationsToConverge} iteration${trrl.iterationsToConverge !== 1 ? 's' : ''}`
            : 'Max iterations reached'}
        </Badge>
        <Badge variant="info">
          tᴄ = {fmt(trrl.tc * 60, 1)} min ({fmt(trrl.tc, 3)} hr)
        </Badge>
      </div>

      {/* ── Primary discharge comparison ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* TRRL Q */}
        <div
          className="rounded-xl border-2 p-4 text-center"
          style={{ borderColor: 'var(--color-accent)', background: 'rgba(59,130,246,0.05)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: 'var(--color-accent)' }}>
            TRRL (Primary)
          </p>
          <p className="font-mono font-bold text-2xl" style={{ color: 'var(--color-accent)' }}>
            {fmt(trrl.Q, 2)}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            m³/s peak discharge
          </p>
        </div>

        {/* Rational Q */}
        <div
          className="rounded-xl border p-4 text-center"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: 'var(--color-warning)' }}>
            Rational Method
          </p>
          <p className="font-mono font-bold text-2xl" style={{ color: 'var(--color-warning)' }}>
            {fmt(hydrology.peakDischarge, 2)}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            m³/s peak discharge
          </p>
        </div>
      </div>

      {/* ── Deviation banner ──────────────────────────────────────────── */}
      <div
        className="rounded-lg p-3 mb-5 flex items-center justify-between gap-4"
        style={{
          background: isOverestimate ? 'rgba(245,158,11,0.08)' : 'rgba(16,179,110,0.08)',
          border: `1px solid ${isOverestimate ? 'rgba(245,158,11,0.3)' : 'rgba(16,179,110,0.3)'}`,
        }}
      >
        <div>
          <p className="text-sm font-semibold" style={{
            color: isOverestimate ? 'var(--color-warning)' : 'var(--color-success)',
          }}>
            Rational Method {isOverestimate ? 'overestimates' : 'underestimates'} TRRL by{' '}
            <span className="font-mono">{fmt(absDiff, 1)}%</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {isOverestimate
              ? 'Consistent with literature: Rational Method overestimates for large East African catchments'
              : 'Rational Method gives conservative (lower) estimate vs TRRL'}
          </p>
        </div>
        <span
          className="shrink-0 font-mono font-bold text-lg"
          style={{ color: isOverestimate ? 'var(--color-warning)' : 'var(--color-success)' }}
        >
          {isOverestimate ? '+' : ''}{fmt(trrl.vsRationalPercent, 1)}%
        </span>
      </div>

      {/* ── TRRL formula reference ────────────────────────────────────── */}
      <div
        className="rounded-lg p-3 mb-5"
        style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Formula (TRRL Road Note 5, 1976)
        </p>
        <p className="font-mono text-xs" style={{ color: 'var(--color-text-primary)' }}>
          Q = Cₐ · A<sup>0.9</sup> · R₂₄<sup>0.75</sup> · (24/tᴄ)<sup>0.25</sup>
        </p>
        <p className="font-mono text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          tᴄ = 0.604 · (A/Q)<sup>0.4</sup>
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            { sym: 'Cₐ',  val: `${trrl.ca}`,                              desc: 'Area coeff.' },
            { sym: 'A',   val: `${fmt(trrl.areaKm2, 3)} km²`,            desc: 'Catchment area' },
            { sym: 'R₂₄', val: `${fmt(trrl.r24Mm, 1)} mm`,              desc: 'Gumbel XT depth' },
          ].map(({ sym, val, desc }) => (
            <div key={sym} className="text-center">
              <p className="font-mono text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>{sym}</p>
              <p className="font-mono text-xs" style={{ color: 'var(--color-text-primary)' }}>{val}</p>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Iteration log (collapsible table) ────────────────────────── */}
      <div>
        <p className="label mb-2">Iteration Log</p>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Iter', 'tᴄ (in, hr)', 'Q (m³/s)', 'tᴄ (out, hr)', 'ΔQ', 'Status'].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'right',
                      paddingBottom: '0.5rem',
                      fontSize: '0.68rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trrl.iterations.map((it) => (
                <tr
                  key={it.iteration}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: it.converged ? 'rgba(22,179,110,0.06)' : 'transparent',
                  }}
                >
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{it.iteration}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>{fmt(it.tcIn, 3)}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600 }}>{fmt(it.Q, 3)}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>{fmt(it.tcOut, 3)}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{fmt(it.delta, 3)}</td>
                  <td style={{ textAlign: 'right', padding: '0.5rem 0' }}>
                    {it.converged ? (
                      <Badge variant="validated">✓</Badge>
                    ) : (
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  )
}