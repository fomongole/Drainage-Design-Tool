import type { ManningsN } from '@/core/types/inputs'

export interface ManningsOption {
  value: ManningsN
  label: string
  description: string
  isDefault: boolean
}

export const MANNINGS_OPTIONS: ManningsOption[] = [
  {
    value: 0.013,
    label: 'n = 0.013',
    description: 'Smooth concrete (recommended for lined urban channels)',
    isDefault: true,
  },
  {
    value: 0.015,
    label: 'n = 0.015',
    description: 'Finished concrete — cast in-situ, good finish',
    isDefault: false,
  },
  {
    value: 0.017,
    label: 'n = 0.017',
    description: 'Unfinished concrete — rough or form-finished',
    isDefault: false,
  },
  {
    value: 0.022,
    label: 'n = 0.022',
    description: 'Excavated earth, clean — freshly graded earthen channel',
    isDefault: false,
  },
  {
    value: 0.025,
    label: 'n = 0.025',
    description: 'Gravel — gravel-lined or gravel-bed channel',
    isDefault: false,
  },
  {
    value: 0.030,
    label: 'n = 0.030',
    description: 'Natural channel — unlined, natural stream cross-section',
    isDefault: false,
  },
]

export const DEFAULT_MANNINGS_N: ManningsN = 0.013