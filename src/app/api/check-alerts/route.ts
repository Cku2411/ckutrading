// app/api/check-alerts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

const TELEGRAM_TOKEN = process.env.TG_TOKEN!;
const CHAT_ID = process.env.TG_CHAT_ID!;
const WORKER_URL = process.env.WORKER_URL;

console.log(TELEGRAM_TOKEN, CHAT_ID, WORKER_URL);

// URL Cloudflare Worker của bạn

type WorkerPrice = {
  pairs: string; // Ví dụ "BTCUSDT"
  price: string; // Ví dụ "28650.12000000"
};

async function sendTelegram(text: string) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      { chat_id: CHAT_ID, text }
    );
  } catch (err: unknown) {
    console.error("❌ Telegram send error:", err);
  }
}

export async function POST() {
  if (!WORKER_URL) {
    console.error("❌ WORKER_URL is not set in environment variables");
    return NextResponse.json(
      { error: "WORKER_URL is not set" },
      { status: 500 }
    );
  }
  try {
    // 1. Lấy giá từ Cloudflare Worker
    const workerRes = await fetch(WORKER_URL);
    if (!workerRes.ok) {
      console.error("❌ Worker fetch error:", await workerRes.text());
      return NextResponse.json(
        { error: "Failed to fetch prices" },
        { status: 502 }
      );
    }
    const workerJson = await workerRes.json();
    const allPrices = (workerJson.data as WorkerPrice[]) || [];

    console.log(`so luogn cap binnac: ${allPrices.length} cap`);

    // 2. Lấy danh sách alert active
    const alerts = await prisma.alert.findMany({
      where: { isActive: true },
    });
    if (alerts.length === 0) {
      return NextResponse.json({ msg: "No active alerts" });
    }

    // 3. Chuyển mảng WorkerPrice thành map { "BTCUSDT": 28650.12, ... }
    const priceMap: Record<string, number> = allPrices.reduce((acc, item) => {
      acc[item.pairs] = parseFloat(item.price);
      return acc;
    }, {} as Record<string, number>);

    // 4. Duyệt và xử lý từng alert
    let triggeredCount = 0;
    for (const alert of alerts) {
      // symbol lưu trong DB dạng "BINANCE:BTCUSDT"
      const pair = alert.symbol.replace("BINANCE:", "");
      const currentPrice = priceMap[pair];

      if (currentPrice === undefined) {
        console.warn(`⚠️ Price not found for ${pair}`);
        continue;
      }

      const isTriggered =
        alert.direction === "ABOVE"
          ? currentPrice >= alert.targetPrice
          : currentPrice <= alert.targetPrice;

      if (isTriggered) {
        const directionText =
          alert.direction === "ABOVE" ? "risen above" : "fallen below";
        const text = `🔔 ${alert.symbol} has ${directionText} ${alert.targetPrice}\nCurrent price: ${currentPrice}`;

        await sendTelegram(text);
        await prisma.alert.update({
          where: { id: alert.id },
          data: { isActive: false, triggeredAt: new Date() },
        });

        triggeredCount++;
      }
    }

    // 5. Xóa toàn bộ alert đã inactive
    const deleted = await prisma.alert.deleteMany({
      where: { isActive: false },
    });

    return NextResponse.json({
      processed: alerts.length,
      triggered: triggeredCount,
      deleted: deleted.count,
    });
  } catch (err: unknown) {
    console.error("❌ /api/check-alerts error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
