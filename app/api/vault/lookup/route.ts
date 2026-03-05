import { NextResponse } from "next/server";
import {
  lookupByUPC,
  lookupBySKU,
  searchSneakers,
  generateAffiliateLinks,
} from "@/lib/sneakerLookup";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const upc = searchParams.get("upc");
  const sku = searchParams.get("sku");
  const q = searchParams.get("q");

  try {
    if (upc) {
      const result = await lookupByUPC(upc.trim());
      if (!result) {
        return NextResponse.json({ error: "Sneaker not found" }, { status: 404 });
      }
      return NextResponse.json({ result: { ...result, affiliateLinks: generateAffiliateLinks(result) } });
    }

    if (sku) {
      const result = await lookupBySKU(sku.trim());
      if (!result) {
        return NextResponse.json({ error: "Sneaker not found" }, { status: 404 });
      }
      return NextResponse.json({ result: { ...result, affiliateLinks: generateAffiliateLinks(result) } });
    }

    if (q) {
      const results = await searchSneakers(q.trim());
      return NextResponse.json({ results });
    }

    return NextResponse.json(
      { error: "Provide upc, sku, or q parameter" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Vault lookup error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
