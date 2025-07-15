"use server";

import { prisma } from "@/lib/prisma";

export async function createAlertAction(
  symbol: string,
  targetPrice: number,
  direction: "ABOVE" | "BELOW"
) {
  // optional: console.log để debug xem đã gọi chưa
  console.log("createAlertAction called", { symbol, targetPrice, direction });

  const alert = await prisma.alert.create({
    data: { symbol, targetPrice, direction },
  });
  return alert;
}
