import { load } from "cheerio";
import _ from "lodash";
import { md5 } from "sbg-utility";
import { HexoPageSchema } from "../../types/post";
import { hexoThemesCache } from "../utils/cache";

/**
 * get all images from page/post
 * @param page
 */
async function getImages(page: Partial<HexoPageSchema>) {
  const results: string[] = [];
  if (page && typeof page === "object") {
    if (typeof page.thumbnail === "string") results.push(page.thumbnail);
    if (typeof page.cover === "string") results.push(page.cover);
    if (Array.isArray(page.photos)) {
      results.push(...page.photos);
    }
  }
  if (page.content || page._content) {
    const pageContent = page.content || page._content;
    const cacheKey = "getImages-" + md5(pageContent);
    const cacheValue = await hexoThemesCache.get<string[]>(cacheKey, []);
    if (cacheValue.length === 0) {
      // Collect all image URLs from url
      const $ = load(pageContent);
      $("img").each((_, img) => {
        const element = $(img);

        // Collect URLs from 'src', 'data-src', and 'srcset'
        const src = element.attr("src");
        const dataSrc = element.attr("data-src");
        const srcset = element.attr("srcset");

        if (src) results.push(src);
        if (dataSrc) results.push(dataSrc);

        // If 'srcset' exists, split it into individual URLs (ignoring size descriptors)
        if (srcset) {
          const srcsetUrls = srcset.split(",").map((entry) => entry.trim().split(" ")[0]);
          results.push(...srcsetUrls);
        }
      });
      hexoThemesCache.set(cacheKey, results);
    } else {
      results.push(...cacheValue);
    }
  }
  const final = _.filter(_.uniq(results), _.identity).filter((str) => !str.includes("no-image-svgrepo-com"));
  return final;
}

hexo.extend.helper.register("getImages", getImages);

/**
 * get thumbnail url
 * @param {import("hexo/dist/hexo/locals-d").HexoLocalsData} page
 */
function getThumbnail(page) {
  if (page && typeof page === "object") {
    // priority defined thumbnail in frontmatter
    if (typeof page.thumbnail === "string") return page.thumbnail;
    if (typeof page.cover === "string") return page.cover;
  }
  return _.sample(getImages(page));
}

hexo.extend.helper.register("getThumbnail", function (page) {
  const result = getThumbnail(page);
  if (result) return result;
  return "https://rawcdn.githack.com/dimaslanjaka/public-source/6a0117ddb2ea327c80dbcc7327cceca1e1b7794e/images/no-image-svgrepo-com.svg";
});
