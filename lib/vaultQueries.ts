import { sanityClient, sanityWriteClient } from "@/lib/sanity/client";
import type { VaultEntry, VaultStats } from "@/types/vault";

export async function getUserVault(userId: string): Promise<VaultEntry[]> {
  return sanityClient.fetch(
    `*[_type == "vaultEntry" && userId == $userId] | order(addedAt desc) {
      _id,
      sneakerName,
      brand,
      colorway,
      sku,
      upc,
      size,
      condition,
      pricePaid,
      marketValue,
      imageUrl,
      addedAt,
      affiliateLinks
    }`,
    { userId }
  );
}

export async function addToVault(
  entry: Omit<VaultEntry, "_id">
): Promise<VaultEntry> {
  return sanityWriteClient.create({
    _type: "vaultEntry",
    ...entry,
    addedAt: entry.addedAt || new Date().toISOString(),
  });
}

export async function updateMarketValue(
  id: string,
  marketValue: number
): Promise<void> {
  await sanityWriteClient.patch(id).set({ marketValue }).commit();
}

export async function removeFromVault(id: string): Promise<void> {
  await sanityWriteClient.delete(id);
}

export function computeVaultStats(entries: VaultEntry[]): VaultStats {
  if (!entries.length) {
    return {
      totalPairs: 0,
      totalPaid: 0,
      totalMarketValue: 0,
      totalGain: 0,
      gainPercent: 0,
    };
  }

  const totalPaid = entries.reduce((s, e) => s + (e.pricePaid || 0), 0);
  const totalMarketValue = entries.reduce((s, e) => s + (e.marketValue || 0), 0);
  const totalGain = totalMarketValue - totalPaid;
  const gainPercent = totalPaid > 0 ? (totalGain / totalPaid) * 100 : 0;

  const topGainer = [...entries].sort((a, b) => {
    const aG = (a.marketValue - a.pricePaid) / (a.pricePaid || 1);
    const bG = (b.marketValue - b.pricePaid) / (b.pricePaid || 1);
    return bG - aG;
  })[0];

  return {
    totalPairs: entries.length,
    totalPaid,
    totalMarketValue,
    totalGain,
    gainPercent,
    topGainer,
  };
}
