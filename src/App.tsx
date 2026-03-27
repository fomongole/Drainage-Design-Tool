import { AppShell } from '@/components/layout/AppShell'
import { InputPanel } from '@/features/inputs/components/InputPanel'
import { ResultsPanel } from '@/features/results/components/ResultsPanel'
import { SessionList } from '@/features/saved-sessions/components/SessionList'

export default function App() {
  return (
    <AppShell
      leftPanel={
        <div className="space-y-4">
          <InputPanel />
          <SessionList />
        </div>
      }
      rightPanel={<ResultsPanel />}
    />
  )
}