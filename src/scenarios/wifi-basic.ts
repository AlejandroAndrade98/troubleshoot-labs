import type { Scenario, GameContext } from "../engine/types";

function normalize(input: string) {
  return input.trim().replace(/\s+/g, " ").toLowerCase();
}

const HOST = "8.8.8.8";

export const wifiBasic: Scenario = {
  id: "wifi-basic",
  name: "Restore Wi-Fi Connectivity (Basic)",
  intro:
    "Scenario: Your PC shows “Connected, no Internet”. Use basic commands to validate connectivity and clear the DNS cache. Optional advanced steps are included.",
  steps: [
    // 1) PING
    {
      id: "ping10",
      title: `Ping the public host (${HOST}) with 10 packets (≈15s)`,
      hint: `Type:  ping ${HOST} -n 10`,
      validate: (input, ctx: GameContext) => {
        const ok = normalize(input) === `ping ${HOST} -n 10`;
        if (ok) {
          ctx.vars.pingStats = { sent: 10, recv: 10, loss: 0, avg: 21 };
        }
        return ok;
      },
      successMessage: [
        `Pinging ${HOST} with 32 bytes of data:`,
        `Reply from ${HOST}: bytes=32 time=20ms TTL=117`,
        `Reply from ${HOST}: bytes=32 time=22ms TTL=117`,
        `Reply from ${HOST}: bytes=32 time=19ms TTL=117`,
        `Reply from ${HOST}: bytes=32 time=24ms TTL=117`,
        "",
        `Ping statistics for ${HOST}:`,
        "    Packets: Sent = 10, Received = 10, Lost = 0 (0% loss),",
        "Approximate round trip times in milli-seconds:",
        "    Minimum = 19ms, Maximum = 24ms, Average = 21ms",
        "✅ Connectivity looks good. Continue with the DNS step.",
      ].join("\n"),
    },

    // 2) FLUSHDNS
    {
      id: "flushdns",
      title: "Clear the DNS resolver cache",
      hint: "Type:  ipconfig /flushdns",
      validate: (input) => normalize(input) === "ipconfig /flushdns",
      successMessage: [
        "Windows IP Configuration",
        "",
        "Successfully flushed the DNS Resolver Cache.",
        "✅ DNS cache cleared.",
      ].join("\n"),
    },

    // 3) (Optional) RELEASE
    {
      id: "release",
      title:
        "(Advanced - Optional) Release the IP address (temporarily drops the connection)",
      hint: "Type:  ipconfig /release",
      validate: (input, ctx: GameContext) => {
        const ok = normalize(input) === "ipconfig /release";
        if (ok) ctx.vars.ipReleased = true;
        return ok;
      },
      successMessage: [
        "Windows IP Configuration",
        "",
        "Wireless LAN adapter Wi-Fi:",
        "   IPv4 Address . . . . . . . . . . . . . : (released)",
        "   Subnet Mask  . . . . . . . . . . . . . : (released)",
        "   Default Gateway . . . . . . . . . . .  : (released)",
        "ℹ️ IP released. Now renew to reconnect.",
      ].join("\n"),
    },

    // 4) (Optional) RENEW
    {
      id: "renew",
      title:
        "(Advanced - Optional) Renew the IP address via DHCP (requires release first)",
      hint: "Type:  ipconfig /renew",
      validate: (input, ctx: GameContext) =>
        normalize(input) === "ipconfig /renew" && !!ctx.vars.ipReleased,
      successMessage: [
        "Windows IP Configuration",
        "",
        "Wireless LAN adapter Wi-Fi:",
        "   IPv4 Address . . . . . . . . . . . . . : 192.168.1.57",
        "   Subnet Mask  . . . . . . . . . . . . . : 255.255.255.0",
        "   Default Gateway . . . . . . . . . . .  : 192.168.1.1",
        "✅ IP successfully renewed.",
      ].join("\n"),
    },

    // 5) CLS (clear screen)
    {
      id: "cls",
      title: "Clear the terminal screen",
      hint: "Type:  cls",
      validate: (input) => normalize(input) === "cls",
      successMessage: "__CLEAR__", // your Terminal already handles clearing
    },
  ],
};
