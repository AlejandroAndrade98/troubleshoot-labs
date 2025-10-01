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

  // Utilitarios globales
  if (low === "help") {
    return {
      ok: true,
      out:
        "Comandos: help, hint, clear/cls, whoami, ipconfig, ping <host> [-n N], tracert <host>, dir, cd",
    };
  }
  if (low === "hint") {
    const step = scenario.steps[ctx.stepIndex];
    return { ok: true, out: step?.hint ?? "Sin pista para este paso." };
  }
  if (low === "clear" || low === "cls") {
    return { ok: true, out: "__CLEAR__" };
  }

  // Escenario terminado
  const current = scenario.steps[ctx.stepIndex];
  if (!current) {
    // ¿Coincide con pasos pasados? (mensaje amable)
    for (let i = 0; i < scenario.steps.length; i++) {
      const tmp = cloneCtx(ctx);
      if (scenario.steps[i].validate(input, tmp)) {
        return { ok: true, out: "Ese comando es válido, pero el escenario ya está completado. 🎉" };
      }
    }
    return { ok: false, out: "Escenario completado. Usa 'help' o cambia de escenario." };
  }

  // 1) ¿Cumple paso actual?
  const okCurrent = current.validate(input, ctx);
  if (okCurrent) {
    ctx.stepIndex += 1;
    const done = ctx.stepIndex >= scenario.steps.length;
    ctx.completed = done;
    const msg = current.successMessage ?? "OK";
    return {
      ok: true,
      out: done
        ? `${msg}\n✅ Escenario completado.`
        : `${msg}\n➡️ Siguiente paso: ${scenario.steps[ctx.stepIndex].title}`,
    };
  }

  // 2) ¿Coincide con paso ya completado?
  for (let i = 0; i < ctx.stepIndex; i++) {
    const tmp = cloneCtx(ctx);
    if (scenario.steps[i].validate(input, tmp)) {
      return {
        ok: true,
        out: `Comando correcto, pero ese paso ya fue completado: “${scenario.steps[i].title}”.\n➡️ Ahora: ${current.title}`,
      };
    }
  }

  // 3) ¿Coincide con un paso futuro?
  for (let j = ctx.stepIndex + 1; j < scenario.steps.length; j++) {
    const tmp = cloneCtx(ctx);
    if (scenario.steps[j].validate(input, tmp)) {
      return {
        ok: false,
        out: `Aún no: ese comando corresponde a un paso posterior (“${scenario.steps[j].title}”).\n➡️ Primero: ${current.title}`,
      };
    }
  }

  // 4) Error genérico
  return { ok: false, out: "❌ No es el comando/resultado esperado para este paso. Prueba 'hint'." };
}
