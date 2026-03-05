// types/vault.ts

export interface SneakerLookupResult {
  name: string
  brand: string
  colorway: string
  sku: string
  releaseDate?: string
  retailPrice?: number
  marketPrice?: number
  imageUrl?: string
  upc?: string
}

export interface VaultEntry {
  _id?: string
  _type: 'vaultEntry'
  sneakerName: string
  brand: string
  colorway: string
  sku: string
  size: string
  condition: 'DS' | 'VNDS' | 'Used'
  pricePaid: number
  marketValue: number
  imageUrl?: string
  upc?: string
  addedAt: string
  userId: string
  affiliateLinks?: AffiliateLink[]
}

export interface AffiliateLink {
  retailer: string
  url: string
  price?: number
}

export interface VaultStats {
  totalPairs: number
  totalPaid: number
  totalMarketValue: number
  totalGain: number
  gainPercent: number
  topGainer?: VaultEntry
}
