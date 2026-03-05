import { defineField, defineType } from "sanity";

export const vaultEntry = defineType({
  name: "vaultEntry",
  title: "Vault Entry",
  type: "document",
  fields: [
    defineField({
      name: "userId",
      title: "User ID",
      type: "string",
      description: "Session or auth user identifier",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sneakerName",
      title: "Sneaker Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "string",
    }),
    defineField({
      name: "colorway",
      title: "Colorway",
      type: "string",
    }),
    defineField({
      name: "sku",
      title: "Style Code / SKU",
      type: "string",
    }),
    defineField({
      name: "upc",
      title: "UPC Barcode",
      type: "string",
    }),
    defineField({
      name: "size",
      title: "Size",
      type: "string",
    }),
    defineField({
      name: "condition",
      title: "Condition",
      type: "string",
      options: {
        list: [
          { title: "Deadstock (DS)", value: "DS" },
          { title: "Very Near Deadstock (VNDS)", value: "VNDS" },
          { title: "Used", value: "Used" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "pricePaid",
      title: "Price Paid ($)",
      type: "number",
    }),
    defineField({
      name: "marketValue",
      title: "Current Market Value ($)",
      type: "number",
    }),
    defineField({
      name: "imageUrl",
      title: "Shoe Image URL",
      type: "url",
    }),
    defineField({
      name: "addedAt",
      title: "Date Added",
      type: "datetime",
    }),
    defineField({
      name: "affiliateLinks",
      title: "Affiliate Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "retailer", type: "string", title: "Retailer" }),
            defineField({ name: "url", type: "url", title: "Affiliate URL" }),
            defineField({ name: "price", type: "number", title: "Current Price" }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "sneakerName",
      subtitle: "colorway",
    },
  },
});
