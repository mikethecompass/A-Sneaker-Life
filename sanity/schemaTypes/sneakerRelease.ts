import { defineField, defineType } from "sanity";

export const sneakerRelease = defineType({
  name: "sneakerRelease",
  title: "Sneaker Release",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "brand", title: "Brand", type: "string" }),
    defineField({ name: "colorway", title: "Colorway", type: "string" }),
    defineField({ name: "sku", title: "SKU / Style Code", type: "string" }),
    defineField({ name: "retailPrice", title: "Retail Price", type: "number" }),
    defineField({ name: "imageUrl", title: "Image URL", type: "url" }),
    defineField({
      name: "customImage",
      title: "Custom Image",
      type: "image",
      options: { hotspot: true },
      description: "Optional: upload a custom image to override the default",
    }),
    defineField({ name: "releaseDate", title: "Release Date", type: "datetime" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
    defineField({ name: "affiliateUrl", title: "Affiliate URL", type: "url" }),
  ],
  preview: {
    select: { title: "title", subtitle: "brand" },
  },
});
