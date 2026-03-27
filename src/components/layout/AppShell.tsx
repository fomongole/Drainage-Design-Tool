import { type ReactNode } from 'react'
import { Header } from './Header'

interface AppShellProps {
  leftPanel: ReactNode
  rightPanel: ReactNode
}

export function AppShell({ leftPanel, rightPanel }: AppShellProps) {
  return (
    // Mobile: natural document scroll. Desktop (lg+): fixed viewport, columns scroll independently.
    <div className="min-h-screen lg:h-screen flex flex-col bg-bg-primary">
      <Header />

      <main className="flex-1 lg:min-h-0 flex flex-col lg:flex-row">
        {/* ── Left column: Inputs ── */}
        <aside
          className="w-full lg:w-[420px] xl:w-[460px] shrink-0
                     border-b lg:border-b-0 lg:border-r border-border
                     lg:overflow-y-auto"
        >
          <div className="p-4 sm:p-5 space-y-4">{leftPanel}</div>
        </aside>

        {/* ── Right column: Results ── */}
        <section className="flex-1 lg:overflow-y-auto bg-bg-primary">
          <div className="p-4 sm:p-5 space-y-4">{rightPanel}</div>
        </section>
      </main>
    </div>
  )
}