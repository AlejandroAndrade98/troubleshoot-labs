import { useEffect, useRef, useState } from "react";
import type { Scenario, GameContext } from "../engine/types";
import { evaluateCommand } from "../engine/engine";

type Props = {
  scenario: Scenario;
  ctx: GameContext;
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
  onCommand?: (raw: string) => void;
};

export default function Terminal({ scenario, ctx, inputRef, onCommand }: Props) {
  const [lines, setLines] = useState<string[]>([
    `Scenario: ${scenario.name}`,
    scenario.intro,
    "Type 'help' to see available commands.",
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    if (inputRef && internalInputRef.current) {
      inputRef.current = internalInputRef.current; // OK: MutableRefObject & allows null
    }
  }, [inputRef]);

  const run = () => {
    const cmd = input.trim();
    if (!cmd) return;

    onCommand?.(cmd);

    const res = evaluateCommand(cmd, scenario, ctx);

    setLines((prev) => {
      const next = [...prev, `> ${cmd}`];
      if (res.out === "__CLEAR__") return [`Scenario: ${scenario.name}`];
      return [...next, res.out];
    });

    setInput("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") run();
  };

  return (
    <div className="w-full max-w-3xl rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 backdrop-blur p-4">
      <div className="h-72 overflow-auto font-mono text-sm whitespace-pre-wrap">
        {lines.map((l, i) => (
          <div key={i} className="mb-1">{l}</div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="font-mono text-xs opacity-70">
          {ctx.completed ? "✔️ DONE" : "PS C:\\>"}
        </span>
        <input
          ref={internalInputRef}
          className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none"
          placeholder="Type a command… (help, hint, clear)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          autoFocus
        />
        <button
          className="rounded-lg px-3 py-2 bg-black text-white dark:bg-white dark:text-black"
          onClick={run}
        >
          Run
        </button>
      </div>
    </div>
  );
}
