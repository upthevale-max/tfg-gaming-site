// Discord webhook helper
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1448280601596530749/WiOF7w89TMdwy4xKHATuInUiTlJ1XE_Z_JK-RKbCEocPsli9bx-C8D_jY2t_SyrciPLN";

export async function sendDiscordNotification(message: string) {
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
  }
}
