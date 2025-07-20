import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Your Prisma setup
import axios from "axios";

const TELEGRAM_TOKEN = process.env.TG_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID;

async function sendTelegram(text: string) {
  try {
    const res = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      { chat_id: CHAT_ID, text }
    );
    console.log("✅ Telegram sent:", res.data);
  } catch (err) {
    console.error(
      "❌ Telegram send error:",
      (err as { response?: { data?: unknown } })?.response?.data ||
        (err as Error).message
    );
  }
}

type BinancePrice = { symbol: string; price: string };

export async function POST(request: Request) {
  console.log(`okie nhan post nhé`);

  try {
    const prices = await request.json(); // Binance price data from Worker

    // Reuse your existing alert logic
    const alerts = await prisma.alert.findMany({
      where: { isActive: true },
    });

    if (alerts.length === 0) {
      return NextResponse.json({ msg: "No active alerts" });
    }

    const priceMap = prices.reduce(
      (acc: Record<string, number>, item: { pairs: string; price: string }) => {
        acc[item.pairs] = parseFloat(item.price);
        return acc;
      },
      {}
    );

    // 3. Duyệt từng alert
    let triggeredCount = 0;
    for (const alert of alerts) {
      const pair = alert.symbol.replace("BINANCE:", "");
      const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${pair}`;

      const price = priceMap[pair];

      if (price === undefined) {
        console.warn(`⚠️ Price not found for ${pair}, skipping`);
        continue;
      }

      const isTriggered =
        alert.direction === "ABOVE"
          ? price >= alert.targetPrice
          : price <= alert.targetPrice;

      if (isTriggered) {
        const text = `🔔 *${alert.symbol}* has ${
          alert.direction === "ABOVE" ? "risen above" : "fallen below"
        } *${
          alert.targetPrice
        }*\nCurrent price: *${price}*\n[🔗 View Alert]$${tradingViewUrl}`;

        await sendTelegram(text);

        await prisma.alert.update({
          where: { id: alert.id },
          data: { isActive: false, triggeredAt: new Date() },
        });

        triggeredCount++;
      }
    }

    // 4. Xóa tất cả alert đã inactive
    const deleted = await prisma.alert.deleteMany({
      where: { isActive: false },
    });
    console.log(`🗑 Deleted ${deleted.count} inactive alerts`);

    return NextResponse.json({
      processed: alerts.length,
      triggered: triggeredCount,
      deleted: deleted.count,
    });
  } catch (err) {
    console.error("❌ /api/receive-binance-data error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
