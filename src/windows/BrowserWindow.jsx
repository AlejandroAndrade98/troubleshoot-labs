import { useEffect, useRef, useState } from "react";
import DraggableWindow from "./DraggableWindow";

/**
 * Simulated Edge with:
 * - "New tab" view
 * - Type URL, then Go => Zscaler view
 * - Start Speed Test => results + KPIs
 * - Closing tab/window => onExit() (resets tutorial in parent)
 */
export default function BrowserWindow({
  containerRef,
  initial = "center",
  onExit,
  // tutorial callbacks
  onTypeUrl,        // Step 3: typed a valid URL
  onGoToZscaler,    // Step 4: pressed Go
  onRunSpeedtest,   // Step 5: clicked Start Speed Test
  onResultsShown,   // Step 6: results completed
  onKpiChecked,     // Step 6: clicked any KPI (optional to finish)
  provideRefs,      // { bindUrlInputRef, bindGoBtnRef, bindStartTestRef, bindKpisRef }
}) {
  const [mode, setMode] = useState("newtab"); // "newtab" | "zscaler"

  const handleCloseTab = () => onExit?.();

  return (
    <DraggableWindow
      containerRef={containerRef}
      frameTitle="Edge (simulated)"
      onClose={onExit}
      initial={initial}
    >
      <TabStrip onCloseTab={handleCloseTab} />
      <BrowserChrome
        mode={mode}
        onTypeUrl={onTypeUrl}
        onGo={() => { setMode("zscaler"); onGoToZscaler?.(); }}
        provideRefs={provideRefs}
      />

      {mode === "newtab" && <NewTab />}

      {mode === "zscaler" && (
        <SpeedtestZscaler
          onRunSpeedtest={onRunSpeedtest}
          onResultsShown={onResultsShown}
          onKpiChecked={onKpiChecked}
          provideRefs={provideRefs}
        />
      )}
    </DraggableWindow>
  );
}

/* ---------- UI: Tab strip & chrome ---------- */

function TabStrip({ onCloseTab }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-2 rounded-md bg-neutral-100 dark:bg-neutral-800 px-3 py-1">
        <span className="text-sm">New tab</span>
        <button
          title="Close tab"
          className="text-xs px-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
          onClick={(e) => { e.stopPropagation(); onCloseTab(); }}
        >
          ✕
        </button>
      </div>
      <button
        title="New tab (disabled in demo)"
        className="text-xs px-2 py-1 border rounded-md border-neutral-300 dark:border-neutral-700 opacity-60 cursor-not-allowed"
      >+</button>
    </div>
  );
}

function BrowserChrome({ mode, onTypeUrl, onGo, provideRefs }) {
  const [url, setUrl] = useState("");
  const inputRef = useRef(null);
  const goBtnRef = useRef(null);

  // expose refs to parent
  useEffect(() => {
    provideRefs?.bindUrlInputRef?.(inputRef.current);
    provideRefs?.bindGoBtnRef?.(goBtnRef.current);
  }, [provideRefs]);

  const handleChange = (e) => {
    if (mode !== "newtab") return;
    const val = e.target.value;
    setUrl(val);
    const normalized = val.trim().toLowerCase();
    if (normalized.includes("speedtest.zscaler.com/perf")) {
      onTypeUrl?.(); // Step 3 reached
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-b border-neutral-200 dark:border-neutral-800">
      <button className="text-xs px-2 py-1 border rounded-md border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">◀</button>
      <button className="text-xs px-2 py-1 border rounded-md border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">▶</button>
      <button className="text-xs px-2 py-1 border rounded-md border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">⟲</button>

      <input
        ref={inputRef}
        className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-1 text-sm"
        placeholder={mode === "newtab" ? "Search or enter web address" : "https://speedtest.zscaler.com/perf"}
        value={mode === "newtab" ? url : "https://speedtest.zscaler.com/perf"}
        onChange={handleChange}
        readOnly={mode !== "newtab"}
      />

      <button
        ref={goBtnRef}
        className={`text-xs px-2 py-1 border rounded-md border-neutral-300 dark:border-neutral-700 ${mode === "newtab" ? "hover:bg-neutral-100 dark:hover:bg-neutral-800" : "opacity-50 cursor-not-allowed"}`}
        onClick={mode === "newtab" ? onGo : undefined}
        title={mode === "newtab" ? "Go" : "Read-only in this view"}
      >
        Go
      </button>
    </div>
  );
}

/* ---------- Views ---------- */

function NewTab() {
  return (
    <div className="p-8">
      <div className="text-2xl font-semibold mb-2">New tab</div>
      <div className="opacity-70">Type or paste a URL and press <b>Go</b>.</div>
    </div>
  );
}

function SpeedtestZscaler({ onRunSpeedtest, onResultsShown, onKpiChecked, provideRefs }) {
  const [state, setState] = useState("idle"); // idle | running | done
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const startBtnRef = useRef(null);
  const kpisWrapRef = useRef(null);

  // expose refs
  useEffect(() => {
    provideRefs?.bindStartTestRef?.(startBtnRef.current);
    provideRefs?.bindKpisRef?.(kpisWrapRef.current);
  }, [provideRefs]);

  const startTest = () => {
    if (state === "running") return;
    setResult(null);
    setProgress(0);
    setState("running");
    onRunSpeedtest?.(); // hide overlay while running
  };

  useEffect(() => {
    if (state !== "running") return;
    let pct = 0;
    const id = setInterval(() => {
      pct = Math.min(pct + Math.random() * 18, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(id);
        const download = +(40 + Math.random() * 90).toFixed(2);
        const upload   = +(60 + Math.random() * 110).toFixed(2);
        const jitter   = +(1 + Math.random() * 8).toFixed(1);
        const latency  = +(10 + Math.random() * 30).toFixed(2);
        const payload = {
          location: "Example of location, US",
          ip: "152.203.52.232",
          egressName: "MIA3",
          egressCity: "Miami, FL, United States",
          gateway: "zs3-mia3-2e6-sme.gateway.zscalerthree.net",
          gwIp: "136.226.59.17",
          download, upload, jitter, latency,
          when: new Date().toLocaleString(),
        };
        setResult(payload);
        setState("done");
        onResultsShown?.(payload); // Step 6: results ready
      }
    }, 350);
    return () => clearInterval(id);
  }, [state, onResultsShown]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-lg font-semibold">Zscaler Cloud Performance Test</h2>
        <span className="text-xs opacity-70">powered by ZDX (simulated)</span>
      </div>

      {/* HERO */}
      <div className="relative rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-50 dark:bg-neutral-900 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-4 md:p-6 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">You</div>
                <div className="opacity-80">{result?.location ?? "Detecting..."}</div>
                <div className="opacity-60 text-xs">{result?.ip ?? "Public IP: 152.203.52.232"}</div>
              </div>
              <div>
                <div className="font-medium">{result?.egressName ?? "MIA3"}</div>
                <div className="opacity-80">{result?.egressCity ?? "Miami, FL, United States"}</div>
                <div className="opacity-60 text-xs">{result?.gateway ?? "zs3-mia3-2e6-sme.gateway.zscalerthree.net"}</div>
                <div className="opacity-60 text-xs">{result?.gwIp ?? "136.226.59.17"}</div>
              </div>
            </div>
            <div className="flex-1" />
            <div className="text-xs opacity-60 mt-2 md:mt-0">Connected via Zscaler Client Connector (simulated)</div>
          </div>
          <div className="hidden md:block bg-cover bg-center" style={{ backgroundImage: "url('/simuladorZscaler.png')", minHeight: 220 }} />
        </div>
        <div className="md:hidden w-full h-36 bg-cover bg-center" style={{ backgroundImage: "url('/simuladorZscaler.png')" }} />
      </div>

      {/* Button / progress */}
      <div className="flex justify-center mb-2">
        {state !== "running" ? (
          <button ref={startBtnRef} className="btn px-4 py-2 text-sm" onClick={startTest}>
            {state === "done" ? "Run Again" : "Start Speed Test"}
          </button>
        ) : (
          <div className="w-64">
            <div className="text-xs opacity-80 mb-1 text-center">Running…</div>
            <div className="h-2 rounded bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div ref={kpisWrapRef} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="HTTP JITTER" value={`${result?.jitter ?? 0} ms`} ready={state === "done"} onInspect={onKpiChecked} />
        <Kpi label="DOWNLOAD BANDWIDTH" value={`${result?.download ?? 0} Mbps`} ready={state === "done"} onInspect={onKpiChecked} />
        <Kpi label="UPLOAD BANDWIDTH" value={`${result?.upload ?? 0} Mbps`} ready={state === "done"} onInspect={onKpiChecked} />
        <Kpi label="LATENCY (Egress)" value={`${result?.latency ?? 0} ms`} ready={state === "done"} onInspect={onKpiChecked} />
      </div>

      {state === "done" && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 mt-4">
          <div className="text-sm font-medium mb-2">Hop View (simulated)</div>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">You</span>
            <span>—</span>
            <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">{result.egressName}</span>
            <span className="opacity-60">({result.gateway})</span>
          </div>
          <div className="text-xs opacity-70 mt-3">Tested at {result.when}</div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, ready, onInspect }) {
  const handleClick = () => {
    if (ready) onInspect?.(label);
  };
  return (
    <button
      onClick={handleClick}
      className="text-left rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white/60 dark:bg-neutral-900/60 hover:ring-2 hover:ring-red-500/60 transition"
    >
      <div className="text-xs opacity-70">{label}</div>
      <div className={`text-xl font-semibold ${ready ? "" : "opacity-50"}`}>{value}</div>
      {!ready && <div className="text-xs opacity-60 mt-1">—</div>}
    </button>
  );
}
