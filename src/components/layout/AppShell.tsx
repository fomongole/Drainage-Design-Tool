import { type ReactNode } from 'react'
import { Header } from './Header'

interface AppShellProps {
  leftPanel: ReactNode
  rightPanel: ReactNode
}

export function AppShell({ leftPanel, rightPanel }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Header />

      {/* Two-column layout on large screens, stacked on mobile */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ── Left column: Inputs ── */}
        <aside
          className="w-full lg:w-[420px] xl:w-[460px] shrink-0 lg:border-r border-border
                     lg:overflow-y-auto"
        >
          <div className="p-5 space-y-4">{leftPanel}</div>
        </aside>

        {/* ── Right column: Results ── */}
        <section className="flex-1 lg:overflow-y-auto bg-bg-primary">
          <div className="p-5 space-y-4">{rightPanel}</div>
        </section>
      </main>
    </div>
  )
}