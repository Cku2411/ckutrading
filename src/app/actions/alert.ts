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
// 🔥 Hàm mới: lấy toàn bộ alert đang active từ database
export async function getActiveAlertsAction() {
  const alerts = await prisma.alert.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  // optional: chỉnh sửa dữ liệu nếu cần
  return alerts.map((a) => ({
    id: a.id,
    symbol: a.symbol.replace("BINANCE:", ""),
    direction: a.direction,
    targetPrice: a.targetPrice,
  }));
}

// 🔥 Hàm mới: xóa alert theo ID
export async function deleteAlertAction(id: number) {
  await prisma.alert.delete({ where: { id } });
  return { success: true };
}
