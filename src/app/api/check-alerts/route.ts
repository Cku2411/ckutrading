// app/api/check-alerts/route.ts
import axios from "axios";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TELEGRAM_TOKEN = process.env.TG_TOKEN!;
const CHAT_ID = process.env.TG_CHAT_ID!;

console.log("🔍 check-alerts triggered");
console.log("TG_TOKEN:", TELEGRAM_TOKEN ? "✅" : "❌ missing");
console.log("CHAT_ID:", CHAT_ID ? "✅" : "❌ missing");

// hàm gửi message qua Telegram
async function sendTelegram(text: string) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      { chat_id: CHAT_ID, text }
    );
  } catch (err) {
    console.error("❌ Telegram send error:", err);
  }
}

export async function GET() {
  try {
    // 1. Lấy tất cả alert đang active
    const alerts = await prisma.alert.findMany({
      where: { isActive: true },
    });
    if (alerts.length === 0) {
      return NextResponse.json({ msg: "No active alerts" });
    }

    // 2. Gom nhóm alerts theo symbol
    const bySymbol = alerts.reduce<Record<string, typeof alerts>>((acc, a) => {
      acc[a.symbol] ??= [];
      acc[a.symbol].push(a);
      return acc;
    }, {});

    // 3. Duyệt từng group để fetch price một lần
    for (const [symbol, list] of Object.entries(bySymbol)) {
      const pair = symbol.replace("BINANCE:", "");
      let price: number;

      try {
        const { data } = await axios.get<{ price: string }>(
          `https://api.binance.com/api/v3/ticker/price?symbol=${pair}`
        );
        price = parseFloat(data.price);
      } catch (err) {
        console.error(`❌ Error fetching price for ${symbol}:`, err);
        continue;
      }

      // 4. Kiểm tra từng alert trong group
      for (const alert of list) {
        const isTriggered =
          alert.direction === "ABOVE"
            ? price >= alert.targetPrice
            : price <= alert.targetPrice;

        if (isTriggered) {
          const text = `🔔 ${symbol} has ${
            alert.direction === "ABOVE" ? "risen above" : "fallen below"
          } ${alert.targetPrice}\nCurrent price: ${price}`;

          // gửi Telegram
          await sendTelegram(text);

          // đánh dấu đã fire
          await prisma.alert.update({
            where: { id: alert.id },
            data: { isActive: false, triggeredAt: new Date() },
          });
        }
      }

      // delete all inActive
      await prisma.alert.deleteMany({
        where: { isActive: false },
      });
    }

    return NextResponse.json({ processed: alerts.length });
  } catch (err) {
    console.error("❌ /api/check-alerts error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
