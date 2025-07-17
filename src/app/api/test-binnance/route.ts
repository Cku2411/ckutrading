// app/api/test-binance/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const { data } = await axios.get(
      "https://api.binance.com/api/v3/ticker/price"
    );
    return NextResponse.json({ ok: true, count: data.length });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      ok: false,
    });
  }
}
