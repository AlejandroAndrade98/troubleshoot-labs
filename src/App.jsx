import Terminal from "../src/terminal/Terminal";
import { wifiBasic } from "../src/scenarios/wifi-basic";
import { createContext } from "../src/engine/engine";

const ctx = createContext();

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">🧪 Troubleshoot Labs</h1>
          <nav className="text-sm opacity-80">v0.1 • Tailwind v4</nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-6">
          <h2 className="text-xl font-semibold">Escenario actual</h2>
          <p className="opacity-80">Simulador de terminal + pasos guiados.</p>
        </section>

        <Terminal scenario={wifiBasic} ctx={ctx} />
      </main>
    </div>
  );
}

