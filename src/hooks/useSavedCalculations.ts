import { useCalculationStore } from '@/store/calculationStore'

export function useSavedCalculations() {
  const {
    savedSessions,
    saveSession,
    loadSession,
    deleteSession,
    results,
    inputs,
  } = useCalculationStore()

  const canSave = Boolean(inputs && results)

  return {
    savedSessions,
    canSave,
    saveSession,
    loadSession,
    deleteSession,
  }
}