// All output types produced by the calculation engine

export interface HydrologyResults {
  /** Time of concentration via Kirpich formula (minutes) */
  timeOfConcentration: number
  /** T-year design rainfall depth via Gumbel analysis (mm) */
  designRainfallDepth: number
  /** Design rainfall intensity at duration = tc (mm/hr) */
  designIntensity: number
  /** Peak runoff discharge via Rational Method (m³/s) */
  peakDischarge: number
  /** Actual design duration used (minutes) — tc or override */
  designDuration: number
}

export interface IDFRow {
  /** Storm duration (minutes) */
  duration: number
  /** Rainfall intensity at this duration (mm/hr) */
  intensity: number
  /** Whether this row is the design duration row (highlighted in amber) */
  isDesignDuration: boolean
}

export interface ChannelDesignResults {
  /** Normal flow depth (m) */
  flowDepth: number
  /** Base width of trapezoidal channel (m) — B = 2D proportionate section */
  baseWidth: number
  /** Freeboard above normal flow depth (m) */
  freeboard: number
  /** Total construction depth D + freeboard (m) */
  totalDepth: number
  /** Mean flow velocity (m/s) */
  velocity: number
  /** Manning's n used */
  manningsN: number
  /** Froude number */
  froudeNumber: number
  /** Flow regime classification */
  flowRegime: FlowRegime
  /** Velocity check result */
  velocityStatus: VelocityStatus
  /** Cross-section geometry for SVG diagram */
  crossSection: CrossSectionGeometry
  /** Top width of water surface (m) */
  topWidth: number
  /** Wetted perimeter (m) */
  wettedPerimeter: number
  /** Hydraulic radius (m) */
  hydraulicRadius: number
  /** Cross-sectional flow area (m²) */
  flowArea: number
}

export type FlowRegime = 'subcritical' | 'critical' | 'supercritical'

export type VelocityStatus = 'acceptable' | 'sedimentation_risk' | 'erosion_risk'

export interface CrossSectionGeometry {
  baseWidth: number
  flowDepth: number
  freeboard: number
  sideSlope: number
  totalDepth: number
  topWidth: number
}

/** Full results from a single calculation run */
export interface CalculationResults {
  hydrology: HydrologyResults
  idfTable: IDFRow[]
  channelDesign: ChannelDesignResults
  /** Time taken for automated calculation in milliseconds */
  calculationTimeMs: number
}