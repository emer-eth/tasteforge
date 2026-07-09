import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchWalletHoldings } from "@/lib/chain/wallet-holdings";

const bodySchema = z.object({
  address: z.string().min(42).max(42),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address } = bodySchema.parse(body);
    const holdings = await fetchWalletHoldings(address);

    return NextResponse.json(holdings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 },
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    if (!address) {
      return NextResponse.json(
        { error: "Missing address query param" },
        { status: 400 },
      );
    }
    const holdings = await fetchWalletHoldings(address);
    return NextResponse.json(holdings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}