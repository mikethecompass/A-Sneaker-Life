import { createClient } from "@sanity/client";

// Read-only client for frontend queries
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-07-01",
  useCdn: true,
});

// Write client for API routes (server-side only)
export const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-07-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
