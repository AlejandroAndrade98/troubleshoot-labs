import type { Scenario, GameContext } from "../engine/types";

function normalize(input: string) {
  return input.trim().replace(/\s+/g, " ").toLowerCase();
}

const HOST = "8.8.8.8";

export const wifiBasic: Scenario = {
  id: "wifi-basic",
  name: "Restaurar conectividad Wi-Fi (Básico)",
  intro:
    "Escenario: Tu PC dice 'Conectado sin Internet'. Usa comandos básicos para validar conectividad y limpiar caché DNS. Si quieres, prueba los opcionales.",
  steps: [
    // 1) PING
    {
      id: "ping10",
      title: `Haz ping de ~15s al host público (${HOST}) con 10 paquetes`,
      hint: `Escribe:  ping ${HOST} -n 10`,
      validate: (input, ctx: GameContext) => {
        const ok = normalize(input) === `ping ${HOST} -n 10`;
        if (ok) {
          ctx.vars.pingStats = { sent: 10, recv: 10, loss: 0, avg: 21 };
        }
        return ok;
      },
      successMessage: [
        `Haciendo ping a ${HOST} con 32 bytes de datos:`,
        `Respuesta desde ${HOST}: bytes=32 tiempo=20ms TTL=117`,
        `Respuesta desde ${HOST}: bytes=32 tiempo=22ms TTL=117`,
        `Respuesta desde ${HOST}: bytes=32 tiempo=19ms TTL=117`,
        `Respuesta desde ${HOST}: bytes=32 tiempo=24ms TTL=117`,
        "",
        `Estadísticas de ping para ${HOST}:`,
        "    Paquetes: enviados = 10, recibidos = 10, perdidos = 0 (0% perdidos),",
        "Tiempos aproximados de ida y vuelta en milisegundos:",
        "    Mínimo = 19ms, Máximo = 24ms, Media = 21ms",
        "✅ Conectividad OK. Continúa al paso de DNS.",
      ].join("\n"),
    },

    // 2) FLUSHDNS
    {
      id: "flushdns",
      title: "Limpia la caché DNS",
      hint: "Escribe:  ipconfig /flushdns",
      validate: (input) => normalize(input) === "ipconfig /flushdns",
      successMessage: [
        "Configuración de IP de Windows",
        "",
        "Se vació correctamente la caché de resolución de DNS.",
        "✅ Caché DNS limpia.",
      ].join("\n"),
    },

    // 3) (Opcional) RELEASE
    {
      id: "release",
      title:
        "(Opcional avanzado) Libera la dirección IP (puede cortar la conexión momentáneamente)",
      hint: "Escribe:  ipconfig /release",
      validate: (input, ctx: GameContext) => {
        const ok = normalize(input) === "ipconfig /release";
        if (ok) ctx.vars.ipReleased = true;
        return ok;
      },
      successMessage: [
        "Configuración de IP de Windows",
        "",
        "Adaptador Wi-Fi:",
        "   Dirección IPv4. . . . . . . . . . . . . : (liberada)",
        "   Máscara de subred . . . . . . . . . . . : (liberada)",
        "   Puerta de enlace predeterminada . . . . : (liberada)",
        "ℹ️ IP liberada. Ahora renueva para volver a conectarte.",
      ].join("\n"),
    },

    // 4) (Opcional) RENEW
    {
      id: "renew",
      title:
        "(Opcional avanzado) Renueva la dirección IP (DHCP). Requiere haber hecho release antes.",
      hint: "Escribe:  ipconfig /renew",
      validate: (input, ctx: GameContext) =>
        normalize(input) === "ipconfig /renew" && !!ctx.vars.ipReleased,
      successMessage: [
        "Configuración de IP de Windows",
        "",
        "Adaptador Wi-Fi:",
        "   Dirección IPv4. . . . . . . . . . . . . : 192.168.1.57",
        "   Máscara de subred . . . . . . . . . . . : 255.255.255.0",
        "   Puerta de enlace predeterminada . . . . : 192.168.1.1",
        "✅ IP renovada correctamente.",
      ].join("\n"),
    },

    // 5) CLS (limpiar pantalla)
    {
      id: "cls",
      title: "Limpia la pantalla de la terminal",
      hint: "Escribe:  cls",
      validate: (input) => normalize(input) === "cls",
      successMessage: "__CLEAR__", // la Terminal ya soporta limpiar
    },
  ],
};
