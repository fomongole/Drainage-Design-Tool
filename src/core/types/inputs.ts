// All user-facing input parameters for the drainage design tool

export interface CatchmentParams {
  /** Contributing catchment area in hectares */
  area: number
  /** Length of the longest flow path in metres */
  flowPathLength: number
  /** Average slope of the flow path (dimensionless m/m) */
  slope: number
  /** Rational method runoff coefficient (0.1 – 1.0) */
  runoffCoefficient: number
  /** Design return period in years (2 | 5 | 10 | 25 | 50 | 100) */
  returnPeriod: ReturnPeriod
  /**
   * TRRL contributing area coefficient Cₐ (dimensionless).
   * Typical range 0.05–0.25 for East African catchments.
   * Default: 0.13 (Namatala calibration).
   */
  trrlCa: number
}

export type ReturnPeriod = 2 | 5 | 10 | 25 | 50 | 100

export interface RainfallParams {
  /** Mean of annual maximum daily rainfall series (mm) */
  meanAnnualMaxRainfall: number
  /** Standard deviation of annual maximum daily rainfall series (mm) */
  stdDeviation: number
  /**
   * Optional storm duration override in minutes.
   * If 0 or undefined, tc is used as the design duration.
   */
  stormDurationOverride?: number
}

export interface ChannelParams {
  /** Manning's roughness coefficient */
  manningsN: ManningsN
  /** Trapezoidal side slope ratio H:1V (default 1.0) */
  sideSlope: number
  /** Longitudinal channel bed slope (m/m) */
  channelSlope: number
}

export type ManningsN = 0.013 | 0.015 | 0.017 | 0.022 | 0.025 | 0.030

/** Complete set of all inputs required for a full calculation run */
export interface DesignInputs {
  catchment: CatchmentParams
  rainfall: RainfallParams
  channel: ChannelParams
  /** Optional user-given name for this calculation session */
  sessionName?: string
}