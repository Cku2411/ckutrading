// app/api/alerts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// GET /api/alerts
export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("GET /api/alerts error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/alerts
export async function POST(request: Request) {
  try {
    const { symbol, targetPrice, direction } = await request.json();

    // basic validation
    if (
      !symbol ||
      typeof targetPrice !== "number" ||
      !["ABOVE", "BELOW"].includes(direction)
    ) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const alert = await prisma.alert.create({
      data: {
        symbol,
        targetPrice,
        direction,
      },
    });
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error("POST /api/alerts error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
