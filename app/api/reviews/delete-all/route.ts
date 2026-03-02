import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/lib/sanity/client";

export async function POST(req: Request) {
  const authHeader = req.headers.get("x-cron-secret");
  if (authHeader !== "Bearer secret123") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reviews = await sanityWriteClient.fetch<{ _id: string }[]>(`*[_type == "review"]{ _id }`);
  
  let deleted = 0;
  for (const r of reviews) {
    await sanityWriteClient.delete(r._id);
    deleted++;
  }

  return NextResponse.json({ ok: true, deleted });
}
