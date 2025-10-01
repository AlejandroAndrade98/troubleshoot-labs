// windows/DesktopSimTerminal.jsx
import { useMemo, useRef, useState, useEffect } from "react";
import TerminalWindow from "./TerminalWindow";
import DraggableWindow from "./DraggableWindow";


/**
 * Windows-like desktop for Terminal Labs with Settings (Wi-Fi & Proxy) and a guided overlay.
 * Steps (matching your wifiBasic scenario):
 * 1) Click Start
 * 2) Open "Terminal (simulated)" from Start
 * 3) Type:  ping 8.8.8.8 -n 10
 * 4) Type:  ipconfig /flushdns
 * 5) (Optional) Type:  ipconfig /release
 * 6) (Optional) Type:  ipconfig /renew
 * 7) Type:  cls
 */
export default function DesktopSimTerminal({ scenario, ctx, resetCtx }) {
  const desktopRef = useRef(null);

  // Start menu / taskbar
  const [startOpen, setStartOpen] = useState(false);

  // Settings window
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("network");
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [proxyEnabled, setProxyEnabled] = useState(false);

  // Terminal window
  const [termOpen, setTermOpen] = useState(false);
  const [termPinned, setTermPinned] = useState(false); // taskbar icon appears after opening from Start

  // Clock
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Overlay targets (refs)
  const startBtnRef = useRef(null);          // Step 1
  const terminalStartItemRef = useRef(null); // Step 2
  const termInputRef = useRef(null);         // Steps 3..7

  // Steps: 1..7, 999=done
  const [step, setStep] = useState(1);

  // ---------- Handlers ----------
  const closeStart = () => setStartOpen(false);

  const handleStartToggle = () => {
    const next = !startOpen;
    setStartOpen(next);
    if (next) setStep((s) => (s === 1 ? 2 : s)); // Opening Start completes Step 1
  };

  const handleOpenTerminalFromStart = () => {
    setStartOpen(false);
    setTermPinned(true);
    setTermOpen(true);
    setStep((s) => (s === 2 ? 3 : s)); // Focus input next
  };

  const handleOpenSettings = () => {
    setStartOpen(false);
    setSettingsOpen(true);
    setSettingsTab("network");
  };

  const handleCloseTerminal = () => {
    setTermOpen(false);
    setTermPinned(false);
    resetTutorial();
  };

  const resetTutorial = () => {
    setStartOpen(false);
    setStep(1);
    resetCtx?.(); // reset terminal engine context/history
  };

  // Advance steps based on commands (aligns with wifiBasic)
  const norm = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();
  const onCommand = (raw) => {
    const cmd = norm(raw);
    if (step === 3 && cmd === "ping 8.8.8.8 -n 10") setStep(4);
    else if (step === 4 && cmd === "ipconfig /flushdns") setStep(5);
    else if (step === 5 && cmd === "ipconfig /release") setStep(6);
    else if (step === 6 && cmd === "ipconfig /renew") setStep(7);
    else if (step === 7 && cmd === "cls") setStep(999);
  };

  const targets = useMemo(
    () => ({
      1: { ref: startBtnRef,          label: "1. Click Start" },
      2: { ref: terminalStartItemRef, label: "2. Open Terminal (simulated) from Start" },
      3: { ref: termInputRef,         label: "3. Type:  ping 8.8.8.8 -n 10" },
      4: { ref: termInputRef,         label: "4. Type:  ipconfig /flushdns" },
      5: { ref: termInputRef,         label: "5. (Optional) Type:  ipconfig /release" },
      6: { ref: termInputRef,         label: "6. (Optional) Type:  ipconfig /renew" },
      7: { ref: termInputRef,         label: "7. Type:  cls" },
    }),
    []
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900">
      <div
        ref={desktopRef}
        className="relative w-[1200px] h-[700px] rounded-2xl border border-neutral-300 dark:border-neutral-700 overflow-hidden"
        style={{ backgroundImage: "url('/fondoAnimado.png')", backgroundSize: "cover", backgroundPosition: "center" }}
        onClick={closeStart}
      >
        {/* Settings window */}
        {settingsOpen && (
          <div className="relative z-20">
            <DraggableWindow
              containerRef={desktopRef}
              frameTitle="Settings"
              onClose={() => setSettingsOpen(false)}
              initial={{ x: 160, y: 80 }}
            >
              <div className="flex">
                {/* Sidebar */}
                <aside className="w-56 border-r border-neutral-200 dark:border-neutral-800 p-3 space-y-1">
                  <ButtonSide active={settingsTab === "network"} onClick={() => setSettingsTab("network")}>
                    Network
                  </ButtonSide>
                  <ButtonSide active={settingsTab === "proxy"} onClick={() => setSettingsTab("proxy")}>
                    Proxy
                  </ButtonSide>
                </aside>

                {/* Content */}
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

        {/* Terminal window */}
        {termOpen && (
          <TerminalWindow
            containerRef={desktopRef}
            onClose={handleCloseTerminal}
            scenario={scenario}
            ctx={ctx}
            provideRefs={{ bindInputRef: (el) => (termInputRef.current = el) }}
            onCommand={onCommand}
          />
        )}

        {/* Taskbar */}
        <Taskbar
          startOpen={startOpen}
          onToggleStart={handleStartToggle}
          onOpenSettings={handleOpenSettings}
          onOpenTerminalFromStart={handleOpenTerminalFromStart}
          time={time}
          // tutorial refs
          startBtnRef={startBtnRef}
          terminalStartItemRef={terminalStartItemRef}
          // icons/status
          termPinned={termPinned}
          onClickPinnedTerminal={() => setTermOpen(true)}
          wifiEnabled={wifiEnabled}
        />

        {/* Tutorial overlay */}
        {step >= 1 && step <= 7 && (
          <CoachOverlay
            containerRef={desktopRef}
            targetRef={targets[step].ref}
            text={targets[step].label}
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

/* ---------------- subcomponents ---------------- */

function Taskbar({
  startOpen,
  onToggleStart,
  onOpenSettings,
  onOpenTerminalFromStart,
  time,
  startBtnRef,
  terminalStartItemRef,
  termPinned,
  onClickPinnedTerminal,
  wifiEnabled,
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
          >
            ⊞
          </button>

          {/* Terminal icon only after opening from Start */}
          {termPinned && (
            <button
              className="rounded-md px-2 py-1 hover:bg-white/10"
              title="Terminal"
              onClick={onClickPinnedTerminal}
            >
              &gt;_
            </button>
          )}
        </div>

        {/* Right side: Wi-Fi + clock */}
        <div className="absolute right-3 inset-y-0 flex items-center gap-3 text-sm opacity-90">
          <span title={wifiEnabled ? "Wi-Fi connected" : "Wi-Fi off"}>
            {wifiEnabled ? "📶" : "📴"}
          </span>
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
                ref={terminalStartItemRef}
                className="w-full text-left rounded-lg bg-neutral-800/50 hover:bg-neutral-800/70 p-3"
                onClick={onOpenTerminalFromStart}
              >
                <div className="font-medium flex items-center gap-2">
                  <span>＞_</span> <span>Terminal (simulated)</span>
                </div>
                <div className="text-xs opacity-70 mt-1">Open a Windows terminal</div>
              </button>
            </div>
          </div>
        )}
      </div>
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
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white/60 dark:bg-neutral-900/60">
      {children}
    </div>
  );
}

function ButtonSide({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg px-3 py-2 ${active ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
    >
      {children}
    </button>
  );
}

/* -------- Guided overlay (same style used in the Edge flow) -------- */
function CoachOverlay({ containerRef, targetRef, text, step }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    const update = () => {
      if (!containerRef?.current || !targetRef?.current) return setPos(null);
      const c = containerRef.current.getBoundingClientRect();
      const t = targetRef.current.getBoundingClientRect();
      setPos({
        x: t.left - c.left,
        y: t.top - c.top,
        w: t.width,
        h: t.height,
        cw: c.width,
      });
    };
    update();
    window.addEventListener("resize", update);
    const id = setInterval(update, 200); // follow elements that mount/unmount (Start menu, window)
    return () => {
      window.removeEventListener("resize", update);
      clearInterval(id);
    };
  }, [containerRef, targetRef]);

  if (!pos) return null;

  const CALLOUT_WIDTH = 320;
  const calloutX = Math.max(
    8,
    Math.min(pos.x + pos.w / 2 - CALLOUT_WIDTH / 2, pos.cw - CALLOUT_WIDTH - 8)
  );
  // const calloutY = Math.max(8, pos.y - 70);
    const GAP = 16; // distance between target and the callout
  const calloutTop = pos.y + pos.h + GAP; // <-- below the target

  return (
    <div className="absolute inset-0 pointer-events-none z-[60]">
      {/* highlight box */}
      <div
        className="absolute rounded-xl ring-4 ring-red-500/60 transition"
        style={{
          left: pos.x - 6,
          top: pos.y - 6,
          width: pos.w + 12,
          height: pos.h + 12,
        }}
      />
      {/* numbered badge */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-red-600 text-white text-sm font-semibold grid place-items-center shadow"
        style={{ left: pos.x + pos.w, top: pos.y - 10 }}
      >
        {step}
      </div>
      {/* Callout box */}
      <div
        className="absolute rounded-lg bg-white text-black text-sm shadow-xl p-3"
        style={{ left: calloutX, top: calloutTop, width: CALLOUT_WIDTH }}
      >
        {text}
      </div>

      {/* Arrow (SVG line with head), pointing UP towards the target */}
      <svg
        className="absolute pointer-events-none"
        style={{ left: 0, top: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="#ef4444" />
          </marker>
        </defs>
        <line
          x1={calloutX + CALLOUT_WIDTH / 2} // center of callout
          y1={calloutTop - 6}               // start just above the callout
          x2={pos.x + pos.w / 2}            // center of target
          y2={pos.y + pos.h + 6}            // end just below the target
          stroke="#ef4444"
          strokeWidth="3"
          markerEnd="url(#arrowhead)"
        />
      </svg>

    </div>
  );
}
