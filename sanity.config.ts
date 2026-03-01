import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";
import { apiVersion, dataset, projectId } from "./sanity/env";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("A Sneaker Life")
          .items([
            S.listItem()
              .title("Deals")
              .child(
                S.list()
                  .title("Deals")
                  .items([
                    S.listItem()
                      .title("All Deals")
                      .child(S.documentTypeList("deal").title("All Deals")),
                    S.listItem()
                      .title("50%+ Off")
                      .child(
                        S.documentList()
                          .title("50%+ Off")
                          .filter('_type == "deal" && discountTier == 50')
                      ),
                    S.listItem()
                      .title("30% Off")
                      .child(
                        S.documentList()
                          .title("30% Off")
                          .filter('_type == "deal" && discountTier == 30')
                      ),
                    S.listItem()
                      .title("20% Off")
                      .child(
                        S.documentList()
                          .title("20% Off")
                          .filter('_type == "deal" && discountTier == 20')
                      ),
                    S.listItem()
                      .title("10% Off")
                      .child(
                        S.documentList()
                          .title("10% Off")
                          .filter('_type == "deal" && discountTier == 10')
                      ),
                    S.divider(),
                    S.listItem()
                      .title("Not Tweeted Yet")
                      .child(
                        S.documentList()
                          .title("Not Tweeted Yet")
                          .filter('_type == "deal" && !defined(tweetedAt)')
                      ),
                  ])
              ),
            S.listItem()
              .title("Videos")
              .child(S.documentTypeList("video").title("Videos")),
            S.listItem()
              .title("Brands")
              .child(S.documentTypeList("brand").title("Brands")),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
