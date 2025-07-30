import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [tickersRes, metasRes] = await Promise.all([
      fetch("https://api.gateio.ws/api/v4/spot/tickers"),
      fetch("https://api.gateio.ws/api/v4/spot/currency_pairs"),
    ]);

    if (!tickersRes.ok || !metasRes.ok) {
      return NextResponse.json(
        {
          message: "Gate.io error",
          detail: "Failed to fetch tickers or metas",
        },
        { status: 500 }
      );
    }

    const tickers = await tickersRes.json();
    // console.log({ tickers });

    const metas = await metasRes.json();

    return NextResponse.json({ tickers, metas });
  } catch (err: unknown) {
    return NextResponse.json({ message: err }, { status: 500 });
  }
}
