import { useEffect, useMemo, useState } from "react";
// import Terminal from "../terminal/Terminal"; // ⬅️ no longer needed here
import ScenarioPicker from "./ScenarioPicker";
import { createContext } from "../engine/engine";
import { scenarioById, scenarioList, defaultScenarioId } from "../scenarios";
import WindowsSim from "../windows/DesktopSim";
import DesktopSimTerminal from "../windows/DesktopSimTerminal"; // ⬅️ new

export default function App() {
  const [tab, setTab] = useState(() => localStorage.getItem("lab_tab") || "terminal"); // "terminal" | "windows"

  // --- Scenarios / Engine context (shared with Terminal Labs) ---
  const [scenarioId, setScenarioId] = useState(
    () => localStorage.getItem("lab_scenario_id") || defaultScenarioId
  );
  const scenario = useMemo(() => scenarioById(scenarioId), [scenarioId]);

  const [ctx, setCtx] = useState(() => createContext());
  useEffect(() => setCtx(createContext()), [scenarioId]); // reset context when scenario changes
  useEffect(() => localStorage.setItem("lab_scenario_id", scenarioId), [scenarioId]);

  // Persist selected tab
  useEffect(() => localStorage.setItem("lab_tab", tab), [tab]);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">🧪 Troubleshoot Labs</h1>
            <nav className="text-sm opacity-80">v0.1 Alejandro</nav>
          </div>

          {/* Tabs */}
          <div className="mt-3 flex gap-2">
            <button
              className={`px-3 py-2 rounded-lg border text-sm ${
                tab === "terminal"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
              onClick={() => setTab("terminal")}
            >
              Terminal Labs
            </button>
            <button
              className={`px-3 py-2 rounded-lg border text-sm ${
                tab === "windows"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
              onClick={() => setTab("windows")}
            >
              Speedtest Labs
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {tab === "terminal" && (
          <>
            <section className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Terminal Labs (Windows-like)</h2>
                <p className="opacity-80">
                  Run the troubleshooting scenario inside a simulated Windows desktop with a guided walkthrough.
                </p>
              </div>
              <ScenarioPicker
                items={scenarioList}
                value={scenarioId}
                onChange={setScenarioId}
              />
            </section>

            {/* Windows-like desktop that opens the Terminal window + steps */}
            <DesktopSimTerminal
              scenario={scenario}
              ctx={ctx}
              resetCtx={() => setCtx(createContext())}
            />
          </>
        )}

        {tab === "windows" && (
          <>
            <section>
              <h2 className="text-xl font-semibold">Speedtest Labs</h2>
              <p className="opacity-80">
                Perform focused actions: Network & Internet, Wi-Fi adapter, and Proxy settings with a simulated Edge flow.
              </p>
            </section>

            <WindowsSim />
          </>
        )}
      </main>
    </div>
  );
}
