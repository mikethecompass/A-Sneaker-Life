import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "5pfpskut";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-07-01",
  useCdn: true,
});

export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-07-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
