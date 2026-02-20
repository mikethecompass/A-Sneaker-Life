import { defineField, defineType } from "sanity";

export const deal = defineType({
  name: "deal",
  title: "Deal",
  type: "document",
  fields: [
    // ── Core ──────────────────────────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "reference",
      to: [{ type: "brand" }],
    }),

    // ── Media ─────────────────────────────────────────────────────────────────
    defineField({
      name: "imageUrl",
      title: "Product Image URL",
      description: "Direct image URL from the affiliate network",
      type: "url",
    }),

    // ── Pricing ───────────────────────────────────────────────────────────────
    defineField({
      name: "originalPrice",
      title: "Original Price",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "salePrice",
      title: "Sale Price",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "discountPercent",
      title: "Discount %",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(100),
    }),
    defineField({
      name: "discountTier",
      title: "Discount Tier",
      type: "number",
      options: {
        list: [
          { title: "10% Off", value: 10 },
          { title: "20% Off", value: 20 },
          { title: "30% Off", value: 30 },
          { title: "50%+ Off", value: 50 },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "USD",
    }),
    defineField({
      name: "expiresAt",
      title: "Expires At",
      type: "datetime",
    }),

    // ── Affiliate ─────────────────────────────────────────────────────────────
    defineField({
      name: "affiliateUrl",
      title: "Affiliate URL (Switchy)",
      description: "Switchy branded short link",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "network",
      title: "Affiliate Network",
      type: "string",
      options: {
        list: [
          { title: "Impact Radius", value: "impact" },
          { title: "CJ Affiliate", value: "cj" },
          { title: "Manual", value: "manual" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "networkId",
      title: "Network ID",
      description: "Original ID from Impact / CJ for deduplication",
      type: "string",
    }),

    // ── Product Metadata ──────────────────────────────────────────────────────
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "sku",
      title: "SKU / Style Code",
      type: "string",
    }),
    defineField({
      name: "colorway",
      title: "Colorway",
      type: "string",
    }),
    defineField({
      name: "gender",
      title: "Gender",
      type: "string",
      options: {
        list: ["mens", "womens", "youth", "unisex"],
        layout: "radio",
      },
    }),
    defineField({
      name: "sizes",
      title: "Available Sizes",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),

    // ── Social / Publishing ───────────────────────────────────────────────────
    defineField({
      name: "tweetedAt",
      title: "Tweeted At",
      description: "Set automatically when the deal is posted to X/Twitter",
      type: "datetime",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],

  orderings: [
    {
      title: "Discount: Highest",
      name: "discountDesc",
      by: [{ field: "discountPercent", direction: "desc" }],
    },
    {
      title: "Newest First",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Expiring Soon",
      name: "expiresAsc",
      by: [{ field: "expiresAt", direction: "asc" }],
    },
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "discountPercent",
      brand: "brand.name",
      media: "imageUrl",
    },
    prepare({ title, subtitle, brand }) {
      return {
        title,
        subtitle: `${brand ?? "Unknown brand"} — ${subtitle ?? 0}% off`,
      };
    },
  },
});
