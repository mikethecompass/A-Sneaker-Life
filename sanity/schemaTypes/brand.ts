import { defineField, defineType } from "sanity";

export const brand = defineType({
  name: "brand",
  title: "Brand",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Brand Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "website",
      title: "Brand Website",
      type: "url",
    }),
    defineField({
      name: "featured",
      title: "Featured Brand",
      type: "boolean",
      description: "Show this brand in the homepage brand bar",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "name", media: "logo" },
  },
});
