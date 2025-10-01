import { useEffect, useMemo, useRef, useState } from "react";
import DraggableWindow from "./DraggableWindow";
import BrowserWindow from "./BrowserWindow";

/**
 * Guided flow:
 * 1) Start
 * 2) Open Edge (simulated) from Start
 * 3) Type the URL
 * 4) Press Go
 * 5) Run the Speed Test
 * 6) Review the results (click any KPI)
 */
export default function DesktopSim() {
  const desktopRef = useRef(null);

  // Main state
  const [locked, setLocked] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("network");
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [proxyEnabled, setProxyEnabled] = useState(false);

  // Browser
  const [browserOpen, setBrowserOpen] = useState(false);
  const [edgePinned, setEdgePinned] = useState(false); // icon appears only after opening from Start

  // Clock
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Tutorial refs (IMPORTANT: pass refs, not elements)
  const startBtnRef = useRef(null);      // Step 1
  const edgeStartItemRef = useRef(null); // Step 2
  const urlInputRef = useRef(null);      // Step 3 (from BrowserWindow)
  const goBtnRef = useRef(null);         // Step 4 (from BrowserWindow)
  const startTestBtnRef = useRef(null);  // Step 5 (from BrowserWindow)
  const kpisRef = useRef(null);          // Step 6 (from BrowserWindow)

  // Current step: 1..6, 0=hidden (during running), 999=done
  const [step, setStep] = useState(1);

  // Handlers
  const closeAll = () => setStartOpen(false);

  const handleStart = () => {
    const toOpen = !startOpen;
    setStartOpen(toOpen);
    if (toOpen) setStep((n) => (n === 1 ? 2 : n)); // opening Start completes Step 1
  };

  const handleOpenSettings = () => {
    setSettingsOpen(true);
    setStartOpen(false);
    setSettingsTab("network");
  };

  const handleSignOut = () => {
    resetTutorial();
    setLocked(true);
  };

  const handleReconnect = () => setLocked(false);

  // Open Edge from Start (completes Step 2)
  const handleOpenBrowserFromStart = () => {
    setStartOpen(false);
    setEdgePinned(true);
    setBrowserOpen(true);
    setStep((n) => (n === 2 ? 3 : n)); // now type URL
  };

  // Closing the browser/tab => full reset to Step 1
  const handleBrowserExit = () => {
    setBrowserOpen(false);
    setEdgePinned(false);
    resetTutorial();
  };

  const resetTutorial = () => {
    setStartOpen(false);
    setSettingsOpen(false);
    setStep(1);
  };

  // Tutorial callbacks from BrowserWindow
  const onTypedZscalerUrl = () => setStep((n) => (n === 3 ? 4 : n)); // typed correct URL
  const onGoToZscaler = () => setStep((n) => (n === 4 ? 5 : n));     // pressed Go
  // When clicking Run, hide overlay during running:
  const onRunSpeedtest = () => setStep((n) => (n === 5 ? 0 : n));
  // When results are ready, show Step 6:
  const onResultsShown = () => setStep(6);
  const onKpiChecked = () => setStep(999); // finished

  const tutorialTargets = useMemo(
    () => ({
      1: { ref: startBtnRef,      label: "1. Click Start" },
      2: { ref: edgeStartItemRef, label: "2. Open Edge (simulated) from Start" },
      3: { ref: urlInputRef,      label: "3. Type: https://speedtest.zscaler.com/perf" },
      4: { ref: goBtnRef,         label: "4. Press Go" },
      5: { ref: startTestBtnRef,  label: "5. Run the Speed Test" },
      6: { ref: kpisRef,          label: "6. Review the results (click any KPI)" },
    }),
    []
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900">
      <div
        ref={desktopRef}
        className="relative w-[1200px] h-[700px] rounded-2xl border border-neutral-300 dark:border-neutral-700 overflow-hidden"
        style={{ backgroundImage: "url('/fondoAnimado.png')", backgroundSize: "cover", backgroundPosition: "center" }}
        onClick={closeAll}
      >
        {/* Settings window */}
        {settingsOpen && !locked && (
          <div className="relative z-20">
            <DraggableWindow
              containerRef={desktopRef}
              frameTitle="Settings"
              onClose={() => setSettingsOpen(false)}
              initial={{ x: 160, y: 80 }}
            >
              <div className="flex">
                <aside className="w-56 border-r border-neutral-200 dark:border-neutral-800 p-3 space-y-1">
                  <ButtonSide active={settingsTab === "network"} onClick={() => setSettingsTab("network")}>
                    Network
                  </ButtonSide>
                  <ButtonSide active={settingsTab === "proxy"} onClick={() => setSettingsTab("proxy")}>
                    Proxy
                  </ButtonSide>
                </aside>

                <section className="flex-1 p-4 space-y-4">
                  {settingsTab === "network" && (
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold">Network & Internet</h4>

                      <Card>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Wi-Fi Adapter</div>
                            <div className="text-sm opacity-70">{wifiEnabled ? "Connected" : "Disabled"}</div>
                          </div>
                          <Switch checked={wifiEnabled} onChange={() => setWifiEnabled((v) => !v)} />
                        </div>
                        <p className="text-sm opacity-80 mt-2">
                          If you have issues, try toggling the adapter off and on.
                        </p>
                      </Card>

                      <Card>
                        <div className="font-medium mb-1">Status</div>
                        <ul className="text-sm opacity-80 space-y-1">
                          <li>IP: {wifiEnabled ? "10.20.30.57" : "—"}</li>
                          <li>Gateway: {wifiEnabled ? "10.20.30.1" : "—"}</li>
                          <li>DNS: {wifiEnabled ? "10.20.30.1" : "—"}</li>
                        </ul>
                      </Card>
                    </div>
                  )}

                  {settingsTab === "proxy" && (
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold">Proxy</h4>
                      <Card>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Use a proxy server</div>
                            <div className="text-sm opacity-70">{proxyEnabled ? "On" : "Off"}</div>
                          </div>
                          <Switch checked={proxyEnabled} onChange={() => setProxyEnabled((v) => !v)} />
                        </div>
                        <p className="text-sm opacity-80 mt-2">
                          Leave it <b>off</b> for typical home networks.
                        </p>
                      </Card>
                    </div>
                  )}
                </section>
              </div>
            </DraggableWindow>
          </div>
        )}

        {/* Simulated browser */}
        {browserOpen && !locked && (
          <div className="relative z-30">
            <BrowserWindow
              containerRef={desktopRef}
              onExit={handleBrowserExit}
              // Tutorial callbacks
              onTypeUrl={onTypedZscalerUrl}
              onGoToZscaler={onGoToZscaler}
              onRunSpeedtest={onRunSpeedtest}
              onResultsShown={onResultsShown}
              onKpiChecked={onKpiChecked}
              // Bind refs from child
              provideRefs={{
                bindUrlInputRef: (el) => (urlInputRef.current = el),
                bindGoBtnRef: (el) => (goBtnRef.current = el),
                bindStartTestRef: (el) => (startTestBtnRef.current = el),
                bindKpisRef: (el) => (kpisRef.current = el),
              }}
            />
          </div>
        )}

        {/* Taskbar */}
        {!locked && (
          <Taskbar
            startOpen={startOpen}
            onToggleStart={handleStart}
            onOpenSettings={handleOpenSettings}
            onOpenBrowserFromStart={handleOpenBrowserFromStart}
            onSignOut={handleSignOut}
            time={time}
            wifi={wifiEnabled}
            // tutorial refs
            startBtnRef={startBtnRef}
            edgeStartItemRef={edgeStartItemRef}
            // icons
            edgePinned={edgePinned}
            onClickPinnedEdge={() => setBrowserOpen(true)}
          />
        )}

        {/* Lock screen */}
        {locked && <LockedScreen onReconnect={handleReconnect} />}

        {/* Tutorial overlay */}
        {step >= 1 && step <= 6 && (
          <CoachOverlay
            containerRef={desktopRef}
            targetRef={tutorialTargets[step].ref}
            text={tutorialTargets[step].label}
            step={step}
          />
        )}

        {step === 999 && (
          <div className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-green-600 text-white shadow">
            Tutorial completed! 🎉
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function Taskbar({
  startOpen, onToggleStart, onOpenSettings, onOpenBrowserFromStart, onSignOut, time, wifi,
  startBtnRef, edgeStartItemRef,
  edgePinned, onClickPinnedEdge
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/50 dark:bg-black/60 backdrop-blur border-t border-white/10 text-white">
      <div className="relative h-full">
        {/* Center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
          <button
            ref={startBtnRef}
            onClick={(e) => { e.stopPropagation(); onToggleStart(); }}
            className="rounded-md px-3 py-1 hover:bg-white/10"
            title="Start"
          >⊞</button>

          {/* Edge icon only if opened from Start */}
          {edgePinned && (
            <button className="rounded-md px-2 py-1 hover:bg-white/10" title="Edge" onClick={onClickPinnedEdge}>🌐</button>
          )}

          {/* <button className="rounded-md px-2 py-1 hover:bg-white/10" title="VS Code">🧩</button> */}
          <button className="rounded-md px-2 py-1 hover:bg-white/10" title="Teams">💬</button>
        </div>

        {/* Right */}
        <div className="absolute right-3 inset-y-0 flex items-center gap-3 text-sm opacity-90">
          <span title={wifi ? "Wi-Fi connected" : "Wi-Fi off"}>{wifi ? "📶" : "📴"}</span>
          <span>{time}</span>
        </div>

        {/* Start menu */}
        {startOpen && (
          <div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-80 rounded-xl border border-white/10 bg-neutral-900/95 shadow-lg p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 py-2 text-sm opacity-80">Recommended</div>

            <div className="space-y-2">
              <button
                className="w-full text-left rounded-lg bg-neutral-800/50 hover:bg-neutral-800/70 p-3"
                onClick={onOpenSettings}
              >
                <div className="font-medium flex items-center gap-2">
                  <span>⚙️</span> <span>Settings</span>
                </div>
                <div className="text-xs opacity-70 mt-1">Open system settings</div>
              </button>

              <button
                ref={edgeStartItemRef}
                className="w-full text-left rounded-lg bg-neutral-800/50 hover:bg-neutral-800/70 p-3"
                onClick={onOpenBrowserFromStart}
              >
                <div className="font-medium flex items-center gap-2">
                  <span>🌐</span> <span>Edge (simulated)</span>
                </div>
                <div className="text-xs opacity-70 mt-1">Open a fake browser window</div>
              </button>
            </div>

            {/* User + Sign out */}
            <div className="mt-4 flex items-center gap-3 border-top border-neutral-700 pt-3">
              <img
                src="https://ui-avatars.com/api/?name=Alejandro+Andrade"
                alt="User"
                className="w-9 h-9 rounded-full"
              />
              <div className="flex-1">
                <div className="text-sm font-medium">User Example</div>
                <div className="text-xs opacity-70">userexample@anthology.com</div>
              </div>
              <button
                className="text-xs px-2 py-1 border rounded-md border-neutral-600 hover:bg-white/10"
                onClick={onSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LockedScreen({ onReconnect }) {
  return (
    <div className="absolute inset-0 bg-neutral-950/90 text-neutral-100 flex flex-col items-center justify-center gap-4">
      <div className="text-4xl font-semibold">Signed out</div>
      <div className="opacity-80">To continue, reconnect to the Azure VM.</div>
      <button className="btn" onClick={onReconnect}>Reconnect to VM</button>
      <div className="text-xs opacity-60">Tip: if you use Remote Desktop, close and reopen the connection.</div>
    </div>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-green-600" : "bg-neutral-400"}`}
      role="switch" aria-checked={checked}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

function Card({ children }) {
  return <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white/60 dark:bg-neutral-900/60">{children}</div>;
}
function ButtonSide({ active, onClick, children }) {
  return <button onClick={onClick} className={`w-full text-left rounded-lg px-3 py-2 ${active ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}>{children}</button>;
}

/* ---------- Coach overlay (uses targetRef) ---------- */
function CoachOverlay({ containerRef, targetRef, text, step }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const update = () => {
      if (!containerRef?.current || !targetRef?.current) return setPos(null);
      const c = containerRef.current.getBoundingClientRect();
      const t = targetRef.current.getBoundingClientRect();
      setPos({ x: t.left - c.left, y: t.top - c.top, w: t.width, h: t.height, cw: c.width });
    };
    update();
    window.addEventListener("resize", update);
    const id = setInterval(update, 200); // follow elements that mount/unmount (Start menu)
    return () => { window.removeEventListener("resize", update); clearInterval(id); };
  }, [containerRef, targetRef]);

  if (!pos) return null;
  const CALLOUT_WIDTH = 320;
  const calloutX = Math.max(8, Math.min(pos.x + pos.w / 2 - CALLOUT_WIDTH / 2, pos.cw - CALLOUT_WIDTH - 8));
  const calloutY = Math.max(8, pos.y - 70);

  return (
    <div className="absolute inset-0 pointer-events-none z-[60]">
      <div className="absolute rounded-xl ring-4 ring-red-500/60 transition" style={{ left: pos.x - 6, top: pos.y - 6, width: pos.w + 12, height: pos.h + 12 }} />
      <div className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-red-600 text-white text-sm font-semibold grid place-items-center shadow" style={{ left: pos.x + pos.w, top: pos.y - 10 }}>{step}</div>
      <div className="absolute rounded-lg bg-neutral-900 text-white text-sm shadow-xl p-3" style={{ left: calloutX, top: calloutY, width: CALLOUT_WIDTH }}>{text}</div>
      <svg className="absolute pointer-events-none" style={{ left: 0, top: 0, width: "100%", height: "100%" }}>
        <defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#ef4444" /></marker></defs>
        <line x1={calloutX + CALLOUT_WIDTH / 2} y1={calloutY + 70} x2={pos.x + pos.w / 2} y2={pos.y - 8} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowhead)" />
      </svg>
    </div>
  );
}
