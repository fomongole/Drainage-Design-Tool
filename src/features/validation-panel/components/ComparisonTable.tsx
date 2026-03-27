import { Badge } from '@/components/ui/Badge'
import type { ValidationSummary } from '@/core/types/validation'

interface Props {
  summary: ValidationSummary
}

export function ComparisonTable({ summary }: Props) {
  const { results, allValidated, validatedCount, totalEntered } = summary

  if (results.length === 0) return null

  return (
    <div style={{ marginTop: '1.5rem' }}>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Parameter', 'Automated', 'Manual', '% Diff', 'Status'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: h === 'Parameter' ? 'left' : 'right',
                    paddingBottom: '0.75rem',
                    fontSize: '0.7rem',
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
            {results.map((row) => {
              const isValidated = row.status === 'validated'
              const diffColor   = isValidated ? 'var(--color-accent)' : 'var(--color-danger)'

              return (
                <tr
                  key={row.parameter}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  {/* Parameter label */}
                  <td
                    style={{
                      padding: '0.875rem 0',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {row.label}
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        color: 'var(--color-text-muted)',
                        opacity: 0.6,
                      }}
                    >
                      {row.unit}
                    </span>
                  </td>

                  {/* Automated value */}
                  <td
                    style={{
                      padding: '0.875rem 0',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.825rem',
                      color: 'var(--color-accent)',
                      fontWeight: 500,
                    }}
                  >
                    {row.automatedValue.toFixed(
                      row.unit === 'm³/s' ? 4 : row.unit === 'mm/hr' ? 2 : 3
                    )}
                  </td>

                  {/* Manual value */}
                  <td
                    style={{
                      padding: '0.875rem 0',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.825rem',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {row.manualValue.toFixed(
                      row.unit === 'm³/s' ? 4 : row.unit === 'mm/hr' ? 2 : 3
                    )}
                  </td>

                  {/* % Difference */}
                  <td
                    style={{
                      padding: '0.875rem 0',
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.825rem',
                      color: diffColor,
                      fontWeight: 500,
                    }}
                  >
                    {row.percentageDifference.toFixed(2)}%
                  </td>

                  {/* Status badge */}
                  <td style={{ padding: '0.875rem 0', textAlign: 'right' }}>
                    <Badge variant={isValidated ? 'validated' : 'check'}>
                      {isValidated ? 'Validated' : 'Check'}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Summary line ────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {validatedCount} of {totalEntered} parameter
          {totalEntered !== 1 ? 's' : ''} within ±10% tolerance
        </span>
        <Badge variant={allValidated ? 'validated' : 'warning'}>
          {allValidated ? 'All Validated' : `${totalEntered - validatedCount} to Review`}
        </Badge>
      </div>
    </div>
  )
}