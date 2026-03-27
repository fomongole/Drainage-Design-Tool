import { z } from 'zod'

// Reusable helper for required positive numbers
const pos = (label: string) =>
  z.coerce.number().positive(`${label} must be greater than 0`)

export const designInputSchema = z.object({
  // ── Catchment ─────────────────────────────────────────────────────────────
  area: pos('Area'),
  flowPathLength: pos('Flow path length'),
  slope: pos('Slope').max(1, 'Slope must be ≤ 1 m/m (e.g. 0.005)'),
  runoffCoefficient: z.coerce
    .number()
    .min(0.01, 'Must be greater than 0')
    .max(1, 'Must be ≤ 1'),
  returnPeriod: z.coerce
    .number()
    .refine((v) => [2, 5, 10, 25, 50, 100].includes(v), {
      message: 'Select a return period',
    }),

  // ── Rainfall ──────────────────────────────────────────────────────────────
  meanAnnualMaxRainfall: pos('Mean annual rainfall'),
  stdDeviation: pos('Standard deviation'),
  // Optional — empty string → undefined, filled → positive number
  stormDurationOverride: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.coerce.number().positive('Must be > 0 minutes').optional()
  ),

  // ── Channel ───────────────────────────────────────────────────────────────
  manningsN: z.coerce.number().refine(
    (v) => [0.013, 0.015, 0.017, 0.022, 0.025, 0.03].includes(v),
    { message: "Select a Manning's n value" }
  ),
  sideSlope: z.coerce.number().min(0, 'Must be ≥ 0 (use 0 for rectangular)'),
  channelSlope: pos('Channel slope'),
})

export type DesignInputFormValues = z.infer<typeof designInputSchema>