
const WebSocket = require("ws");

const SE_JWT = process.env.SE_JWT;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

if (!SE_JWT || !DISCORD_WEBHOOK) {
  console.error("Configure SE_JWT e DISCORD_WEBHOOK nas variáveis do Render.");
  process.exit(1);
}

const ws = new WebSocket(
  "wss://astro.streamelements.com",
  {
    headers: {
      Authorization: `Bearer ${SE_JWT}`
    }
  }
);

ws.on("open", () => {
  console.log("Conectado à StreamElements.");
  ws.send(JSON.stringify({
    type: "subscribe",
    topic: "channel.loyalty.redemptions",
    token: SE_JWT
  }));
});

ws.on("message", async (raw) => {
  try {
    const event = JSON.parse(raw.toString());
    console.log("Evento recebido:", JSON.stringify(event));

    const text = JSON.stringify(event);
    if (!text.toLowerCase().includes("dino1")) return;

    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "🦖 **Novo resgate da loja ARK!**\n```json\n" +
          JSON.stringify(event, null, 2).slice(0, 1500) +
          "\n```"
      })
    });
  } catch (err) {
    console.error("Erro ao processar evento:", err.message);
  }
});

ws.on("error", (err) => console.error("WebSocket:", err.message));
ws.on("close", () => console.log("Conexão encerrada."));
