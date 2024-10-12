import { load } from "cheerio";
import { StoreFunction } from "hexo/dist/extend/renderer-d";
import { HexoPageSchema } from "../../types/post";

// re-implementation fixer of hexo-seo

/**
 * fix SEO on anchors
 * @param $ CherrioAPI
 * @returns
 */
export function fixAnchor($: ReturnType<typeof load>, data: HexoPageSchema) {
  $("a").each(function () {
    // avoid duplicate rels
    const currentRel = $(this).attr("rel");
    if (currentRel) {
      // Create a Set to store unique rels
      const rels = new Set(currentRel.split(" "));
      // Update the rel attribute with unique values
      $(this).attr("rel", Array.from(rels).join(" "));
    }
    // add anchor title
    if ($(this).attr("title")) {
      $(this).attr("title", data.title ? `${data.title} ${$(this).attr("href")}` : $(this).attr("href"));
    }
  });
  return $;
}

/**
 * callback for after_render:html
 * @param content rendered html string
 * @param data current page data
 */
export default function htmlSeoFixer(content: string, data: HexoPageSchema) {
  let $ = load(content);
  $ = fixAnchor($, data);
  return $.html();
}

hexo.extend.filter.register("after_render:html", htmlSeoFixer as StoreFunction);
