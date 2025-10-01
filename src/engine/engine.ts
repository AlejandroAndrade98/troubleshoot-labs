import type { Scenario, GameContext } from "./types";

export function createContext(): GameContext {
  return { vars: {}, stepIndex: 0, completed: false };
}

function cloneCtx(ctx: GameContext): GameContext {
  return {
    vars: { ...ctx.vars },
    stepIndex: ctx.stepIndex,
    completed: ctx.completed,
  };
}

export function evaluateCommand(raw: string, scenario: Scenario, ctx: GameContext) {
  const input = raw.trim();
  const low = input.toLowerCase();

  // Global utilities
  if (low === "help") {
    return {
      ok: true,
      out:
        "Commands: help, hint, clear/cls, whoami, ipconfig, ping <host> [-n N], tracert <host>, dir, cd",
    };
  }
  if (low === "hint") {
    const step = scenario.steps[ctx.stepIndex];
    return { ok: true, out: step?.hint ?? "No hint available for this step." };
  }
  if (low === "clear" || low === "cls") {
    return { ok: true, out: "__CLEAR__" };
  }

  // Scenario completed
  const current = scenario.steps[ctx.stepIndex];
  if (!current) {
    // Check if it matches a past step (friendly message)
    for (let i = 0; i < scenario.steps.length; i++) {
      const tmp = cloneCtx(ctx);
      if (scenario.steps[i].validate(input, tmp)) {
        return { ok: true, out: "That command is valid, but the scenario is already completed. 🎉" };
      }
    }
    return { ok: false, out: "Scenario finished. Use 'help' or switch to another scenario." };
  }

  // 1) Does it match the current step?
  const okCurrent = current.validate(input, ctx);
  if (okCurrent) {
    ctx.stepIndex += 1;
    const done = ctx.stepIndex >= scenario.steps.length;
    ctx.completed = done;
    const msg = current.successMessage ?? "OK";
    return {
      ok: true,
      out: done
        ? `${msg}\n✅ Scenario completed.`
        : `${msg}\n➡️ Next step: ${scenario.steps[ctx.stepIndex].title}`,
    };
  }

  // 2) Does it match a step already completed?
  for (let i = 0; i < ctx.stepIndex; i++) {
    const tmp = cloneCtx(ctx);
    if (scenario.steps[i].validate(input, tmp)) {
      return {
        ok: true,
        out: `Correct command, but that step was already completed: “${scenario.steps[i].title}”.\n➡️ Current step: ${current.title}`,
      };
    }
  }

  // 3) Does it match a future step?
  for (let j = ctx.stepIndex + 1; j < scenario.steps.length; j++) {
    const tmp = cloneCtx(ctx);
    if (scenario.steps[j].validate(input, tmp)) {
      return {
        ok: false,
        out: `Not yet: that command belongs to a future step (“${scenario.steps[j].title}”).\n➡️ Current step: ${current.title}`,
      };
    }
  }

  // 4) Generic error
  return { ok: false, out: "❌ That is not the expected command/result for this step. Try 'hint'." };
}
