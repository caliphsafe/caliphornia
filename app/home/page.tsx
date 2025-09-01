// app/home/page.tsx
import { Home } from "@/components/views/home"
import { SupportGate } from "@/components/patterns/support-gate"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F3F2EE]">
      <SupportGate>
        <Home />
      </SupportGate>
    </main>
  )
}
