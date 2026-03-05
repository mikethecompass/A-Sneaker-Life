import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUserVault,
  addToVault,
  removeFromVault,
  updateMarketValue,
  computeVaultStats,
} from "@/lib/vaultQueries";

// Simple user ID from cookie — replace with Clerk/NextAuth if you add auth later
function getUserId(request: Request): string {
  // Try header first (for direct API calls)
  const headerUserId = request.headers.get("x-user-id");
  if (headerUserId) return headerUserId;

  // Fall back to cookie-based session
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/vault_user_id=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);

  return "";
}

export async function GET(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const entries = await getUserVault(userId);
    const stats = computeVaultStats(entries);
    return NextResponse.json({ entries, stats });
  } catch (err) {
    console.error("Vault fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch vault" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const entry = await addToVault({ ...body, userId });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    console.error("Vault add error:", err);
    return NextResponse.json({ error: "Failed to add entry" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { id, marketValue } = await request.json();
    await updateMarketValue(id, marketValue);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Vault update error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    await removeFromVault(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Vault delete error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
