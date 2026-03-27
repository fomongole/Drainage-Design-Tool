import { Card } from '@/components/ui/Card'
import type { IDFRow } from '@/core/types/results'

interface Props {
  idfTable: IDFRow[]
}

export function IDFTable({ idfTable }: Props) {
  return (
    <Card
      title="IDF Table"
      subtitle="Design duration row highlighted — i(t) = i₆₀ × (60/t)^0.65"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* ── Header ──────────────────────────────────────────────── */}
          <thead>
            <tr
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <th
                className="label text-left pb-3"
                style={{ width: '45%' }}
              >
                Duration
              </th>
              <th className="label text-right pb-3">
                Intensity (mm/hr)
              </th>
              <th className="label text-right pb-3" style={{ width: '20%' }}>
                Note
              </th>
            </tr>
          </thead>

          {/* ── Body ────────────────────────────────────────────────── */}
          <tbody>
            {idfTable.map((row) => {
              const isDesign = row.isDesignDuration

              return (
                <tr
                  key={row.duration}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: isDesign
                      ? 'rgba(245, 158, 11, 0.08)'
                      : 'transparent',
                  }}
                >
                  {/* Duration */}
                  <td
                    className="py-2.5"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.825rem',
                      color: isDesign
                        ? 'var(--color-warning)'
                        : 'var(--color-text-primary)',
                      fontWeight: isDesign ? 600 : 400,
                    }}
                  >
                    {row.duration} min
                    {row.duration >= 60 && (
                      <span
                        style={{
                          color: 'var(--color-text-muted)',
                          fontSize: '0.7rem',
                          marginLeft: '0.375rem',
                        }}
                      >
                        ({row.duration / 60}h)
                      </span>
                    )}
                  </td>

                  {/* Intensity */}
                  <td
                    className="py-2.5 text-right"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.825rem',
                      color: isDesign
                        ? 'var(--color-warning)'
                        : 'var(--color-text-primary)',
                      fontWeight: isDesign ? 600 : 400,
                    }}
                  >
                    {row.intensity.toFixed(2)}
                  </td>

                  {/* Badge / note */}
                  <td className="py-2.5 text-right">
                    {isDesign ? (
                      <span
                        className="status-badge status-warning"
                        style={{ fontSize: '0.65rem' }}
                      >
                        Design
                      </span>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Legend ──────────────────────────────────────────────────── */}
      <div
        className="mt-4 pt-4 flex items-center gap-2 text-xs"
        style={{
          borderTop: '1px solid var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '2px',
            background: 'rgba(245, 158, 11, 0.25)',
            flexShrink: 0,
          }}
        />
        <span>
          Design duration = time of concentration (tc) or storm duration
          override
        </span>
      </div>
    </Card>
  )
}