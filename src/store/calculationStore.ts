import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { DesignInputs } from '@/core/types/inputs'
import type { CalculationResults } from '@/core/types/results'
import type { ValidationSummary } from '@/core/types/validation'

export interface SavedSession {
  id: string
  name: string
  createdAt: string
  inputs: DesignInputs
  results: CalculationResults
}

interface CalculationStore {
  // ── Current inputs ────────────────────────────────────────────────────────
  inputs: DesignInputs | null
  setInputs: (inputs: DesignInputs) => void

  // ── Latest results ────────────────────────────────────────────────────────
  results: CalculationResults | null
  validationSummary: ValidationSummary | null
  isCalculating: boolean
  calculationError: string | null
  setResults: (results: CalculationResults) => void
  setValidationSummary: (summary: ValidationSummary) => void
  setIsCalculating: (value: boolean) => void
  setError: (error: string | null) => void
  clearResults: () => void

  // ── Saved sessions ────────────────────────────────────────────────────────
  savedSessions: SavedSession[]
  saveSession: (name: string) => void
  loadSession: (id: string) => void
  deleteSession: (id: string) => void
}

export const useCalculationStore = create<CalculationStore>()(
  persist(
    (set, get) => ({
      // ── Inputs ─────────────────────────────────────────────────────────────
      inputs: null,
      setInputs: (inputs) => set({ inputs }),

      // ── Results ────────────────────────────────────────────────────────────
      results: null,
      validationSummary: null,
      isCalculating: false,
      calculationError: null,

      setResults: (results) =>
        set({ results, calculationError: null }),

      setValidationSummary: (validationSummary) =>
        set({ validationSummary }),

      setIsCalculating: (isCalculating) =>
        set({ isCalculating }),

      setError: (calculationError) =>
        set({ calculationError, isCalculating: false }),

      clearResults: () =>
        set({ results: null, validationSummary: null, calculationError: null }),

      // ── Saved sessions ─────────────────────────────────────────────────────
      savedSessions: [],

      saveSession: (name) => {
        const { inputs, results, savedSessions } = get()
        if (!inputs || !results) return

        const session: SavedSession = {
          id: nanoid(),
          name: name.trim() || `Session ${savedSessions.length + 1}`,
          createdAt: new Date().toISOString(),
          inputs,
          results,
        }

        set({ savedSessions: [session, ...savedSessions] })
      },

      loadSession: (id) => {
        const session = get().savedSessions.find((s) => s.id === id)
        if (!session) return
        set({
          inputs: session.inputs,
          results: session.results,
          validationSummary: null,
          calculationError: null,
        })
      },

      deleteSession: (id) => {
        set({
          savedSessions: get().savedSessions.filter((s) => s.id !== id),
        })
      },
    }),
    {
      name: 'drainage_sessions',
      // Only persist savedSessions — inputs and results are ephemeral
      partialize: (state) => ({ savedSessions: state.savedSessions }),
    }
  )
)