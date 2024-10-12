// re-implementation fixer of hexo-seo

import { load } from "cheerio";
import { StoreFunction } from "hexo/dist/extend/renderer-d";
import { HexoPageSchema } from "../../types/post";

export function fixAnchor() {
  //
}

/**
 * callback for after_render:html
 * @param content rendered html string
 * @param data current page data
 */
export default function htmlSeoFixer(content: string, _data: HexoPageSchema) {
  const $ = load(content);

  $("a").each(function () {
    const currentRel = $(this).attr("rel");

    // Create a Set to store unique rels
    const rels = currentRel ? new Set(currentRel.split(" ")) : new Set();

    // Update the rel attribute with unique values
    $(this).attr("rel", Array.from(rels).join(" "));
  });

  return $.html();
}

hexo.extend.filter.register("after_render:html", htmlSeoFixer as StoreFunction);
