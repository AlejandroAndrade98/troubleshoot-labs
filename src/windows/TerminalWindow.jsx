import { useEffect, useRef } from "react";
import DraggableWindow from "./DraggableWindow";
import Terminal from "../terminal/Terminal";

/** Draggable Windows-like window that embeds your Terminal component. */
export default function TerminalWindow({
  containerRef,
  onClose,
  initial = { x: 140, y: 90 },
  scenario,
  ctx,
  provideRefs, // { bindInputRef?: (el) => void }
  onCommand,   // (raw: string) => void
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    provideRefs?.bindInputRef?.(inputRef.current);
  }, [inputRef.current]);

  return (
    <DraggableWindow
      containerRef={containerRef}
      frameTitle="Terminal (simulated)"
      onClose={onClose}
      initial={initial}
      width={880}
    >
      {/* Pass inputRef and onCommand down so the parent can highlight and track commands */}
      <Terminal scenario={scenario} ctx={ctx} inputRef={inputRef} onCommand={onCommand} />
    </DraggableWindow>
  );
}
