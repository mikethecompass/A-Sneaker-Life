import { NextResponse } from "next/server";
import { sanityWriteClient } from "@/lib/sanity/client";

export async function POST(req: Request) {
  const authHeader = req.headers.get("x-cron-secret");
  if (authHeader !== "Bearer secret123") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reviews = await sanityWriteClient.fetch<{ _id: string }[]>(`*[_type == "review"][0..49]{ _id }`);
  
  if (reviews.length === 0) return NextResponse.json({ ok: true, deleted: 0, done: true });

  const mutations = reviews.map(r => ({ delete: { id: r._id } }));
  await sanityWriteClient.mutate(mutations);

  return NextResponse.json({ ok: true, deleted: reviews.length, done: false });
}
