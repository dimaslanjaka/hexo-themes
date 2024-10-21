import * as cheerio from "cheerio";
import { StoreFunction } from "hexo/dist/extend/renderer-d";
import { md5 } from "sbg-utility";
import { HexoPageSchema } from "../../types/post";
import { hexoThemesCache } from "./cache";

// re-implementation fixer of hexo-seo

/**
 * fix SEO on anchors
 * @param $ CherrioAPI
 * @returns
 */
export function fixAnchor($: ReturnType<typeof cheerio.load>, data: HexoPageSchema) {
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

export function fixImages($: ReturnType<typeof cheerio.load>, data: HexoPageSchema) {
  $("img").each(function () {
    const src = $(this).attr("src") || $(this).attr("data-src");
    const alt = $(this).attr("alt") || "";
    if (alt.length === 0) {
      $(this).attr("alt", data.title ? `${data.title} ${src}` : src);
    }
    const title = $(this).attr("title") || "";
    if (title.length === 0) {
      $(this).attr("title", data.title ? `${data.title} ${src}` : src);
    }
    const itemprop = $(this).attr("itemprop");
    if (!itemprop || itemprop.trim() === "") {
      $(this).attr("itemprop", "image");
    }
  });
  return $;
}

/**
 * callback for after_render:html
 * @param content rendered html string
 * @param data current page data
 */
export async function htmlSeoFixer(content: string, data: HexoPageSchema) {
  const cacheKey = "seo-" + md5(content);
  const cacheValue = await hexoThemesCache.get<string>(cacheKey, null);
  if (cacheValue) return cacheValue;
  let $ = cheerio.load(content);
  $ = fixAnchor($, data);
  $ = fixImages($, data);
  const result = $.html();
  hexoThemesCache.set(cacheKey, result);
  return result;
}

hexo.extend.filter.register("after_render:html", htmlSeoFixer as StoreFunction);
