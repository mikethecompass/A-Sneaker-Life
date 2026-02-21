import { defineField, defineType } from "sanity";

export const release = defineType({
  name: "release",
  title: "Release",
  type: "document",
  fields: [
    // ── Core ──────────────────────────────────────────────────────────────────
    defineField({
      name: "title",
      title: "Shoe Name",
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
      name: "brand",
      title: "Brand",
      type: "reference",
      to: [{ type: "brand" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "colorway",
      title: "Colorway",
      description: 'e.g. "University Blue / White / Black"',
      type: "string",
    }),
    defineField({
      name: "sku",
      title: "Style Code / SKU",
      description: 'e.g. "DH7138-400"',
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),

    // ── Media ─────────────────────────────────────────────────────────────────
    defineField({
      name: "imageUrl",
      title: "Product Image URL",
      type: "url",
    }),

    // ── Pricing ───────────────────────────────────────────────────────────────
    defineField({
      name: "retailPrice",
      title: "Retail Price",
      type: "number",
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "USD",
    }),

    // ── Release Details ────────────────────────────────────────────────────────
    defineField({
      name: "releaseDate",
      title: "Release Date",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "releaseTime",
      title: "Release Time (ET)",
      description: 'e.g. "10:00 AM ET"',
      type: "string",
    }),
    defineField({
      name: "releaseType",
      title: "Release Method",
      type: "string",
      options: {
        list: [
          { title: "FCFS (First Come First Served)", value: "fcfs" },
          { title: "Raffle / Draw", value: "raffle" },
          { title: "SNKRS App", value: "snkrs" },
          { title: "In-Store Only", value: "instore" },
          { title: "Online Only", value: "online" },
        ],
        layout: "radio",
      },
      initialValue: "fcfs",
    }),
    defineField({
      name: "gender",
      title: "Gender",
      type: "string",
      options: {
        list: [
          { title: "Men's", value: "mens" },
          { title: "Women's", value: "womens" },
          { title: "Grade School", value: "gs" },
          { title: "Unisex", value: "unisex" },
        ],
        layout: "radio",
      },
      initialValue: "mens",
    }),

    // ── Links ─────────────────────────────────────────────────────────────────
    defineField({
      name: "affiliateUrl",
      title: "Buy / Affiliate URL",
      description: "Link to purchase page (can be a Switchy link)",
      type: "url",
    }),
    defineField({
      name: "stockxUrl",
      title: "StockX URL",
      type: "url",
    }),
    defineField({
      name: "goatUrl",
      title: "GOAT URL",
      type: "url",
    }),
  ],

  orderings: [
    {
      title: "Release Date: Soonest",
      name: "releaseDateAsc",
      by: [{ field: "releaseDate", direction: "asc" }],
    },
    {
      title: "Release Date: Latest",
      name: "releaseDateDesc",
      by: [{ field: "releaseDate", direction: "desc" }],
    },
  ],

  preview: {
    select: {
      title: "title",
      brand: "brand.name",
      releaseDate: "releaseDate",
      media: "imageUrl",
    },
    prepare({ title, brand, releaseDate }) {
      return {
        title,
        subtitle: `${brand ?? "Unknown"} — ${releaseDate ?? "TBD"}`,
      };
    },
  },
});
