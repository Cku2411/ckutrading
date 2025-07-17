// app/api/test-binance/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const { data } = await axios.get(
      "https://api.binance.us/api/v3/ticker/price"
    );
    return NextResponse.json({ prices: data, lengt: data.length });
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Binance.US error:",
        err.response?.data,
        err.response?.status
      );
    }
    return new NextResponse("Failed to fetch prices", { status: 500 });
  }
}
