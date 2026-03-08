import { defineField, defineType } from "sanity";

export const video = defineType({
  name: "video",
  title: "Video",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "youtubeId",
      title: "YouTube Video ID",
      description: "The 11-character ID from the YouTube URL (e.g. dQw4w9WgXcQ)",
      type: "string",
      validation: (Rule) => Rule.required().length(11),
    }),
    defineField({
      name: "thumbnailUrl",
      title: "Thumbnail URL",
      description: "Auto-populated from YouTube API",
      type: "url",
    }),
    defineField({
      name: "customImage",
      title: "Custom Image",
      type: "image",
      options: { hotspot: true },
      description: "Optional: upload a custom image to override the default",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At (YouTube)",
      type: "datetime",
    }),
    defineField({
      name: "viewCount",
      title: "View Count",
      description: "Synced from YouTube API",
      type: "number",
    }),
    defineField({
      name: "likeCount",
      title: "Like Count",
      description: "Synced from YouTube API",
      type: "number",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "featured",
      title: "Featured",
      description: "Show on homepage",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "youtubeId",
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: `youtube.com/watch?v=${subtitle}`,
        media: undefined,
      };
    },
  },
});
