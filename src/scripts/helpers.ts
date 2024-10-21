"use strict";

import cheerio from "cheerio";
import hutil from "hexo-util";
import nunjucks from "nunjucks";
import { md5 } from "sbg-utility";
import { hexoThemesCache } from "./utils/cache";

// Register helper to get posts from the current page
hexo.extend.helper.register("getPosts", function () {
  const { page } = this as unknown as { page: { posts: any[] } };
  return page.posts;
});

// Register helper to get the language setting
hexo.extend.helper.register("getLanguage", function (page: any): string {
  let lang: string | undefined;

  if ("lang" in page) {
    lang = page.lang;
  } else if ("language" in page) {
    lang = page.language;
  } else if ("lang" in hexo.config) {
    lang = hexo.config.lang;
  } else if ("language" in hexo.config) {
    lang = hexo.config.language;
  }

  if (typeof lang === "string") {
    return lang;
  } else if (Array.isArray(lang)) {
    return lang[0];
  }
  return "en";
});

// Register helper to get posts by label
hexo.extend.helper.register(
  "getPostByLabel",
  /**
   * Get posts by key with name.
   * @param by - The key to filter by ('tags' or 'categories').
   * @param filternames - Array of filter names.
   * @returns Array of posts matching the filters.
   */
  function (by: "tags" | "categories", filternames: string[]): Record<string, string>[] {
    const hexo = this as any;
    const data = hexo.site[by].data;

    return filternames.flatMap((filtername) => {
      return data
        .filter(({ name }: { name: string }) => String(name).toLowerCase() === filtername.toLowerCase())
        .flatMap((group: { posts: any[] }) => {
          return group.posts.map(
            ({
              title,
              permalink,
              thumbnail,
              photos
            }: {
              title: string;
              permalink: string;
              thumbnail: string;
              photos: any[];
            }) => {
              return { title, permalink, thumbnail, photos };
            }
          );
        });
    });
  }
);

// Register JSON stringification helper
hexo.extend.helper.register("json_stringify", function (value: any, spaces?: number) {
  if (value instanceof nunjucks.runtime.SafeString) {
    value = value.toString();
  }
  const jsonString = JSON.stringify(value, null, spaces).replace(/</g, "\\u003c");
  return new nunjucks.runtime.SafeString(jsonString);
});

// Register helper to get object keys
hexo.extend.helper.register("object_keys", function (obj: Record<string, any>) {
  return Object.keys(obj);
});

// Register helper to check if an object is an array
hexo.extend.helper.register("is_array", function (obj: any) {
  return Array.isArray(obj);
});

/**
 * Fix URL by removing double slashes and optionally decoding it.
 * @param url - The URL to fix.
 * @param options - Options for fixing the URL.
 * @returns The fixed URL.
 */
function fixURL(url: string, options: { decode?: boolean } = {}): string {
  const fixed = url.replace(/([^:]\/)\/+/gm, "$1");
  if (options.decode) return decodeURI(fixed);
  return fixed;
}

hexo.extend.helper.register("fixURL", fixURL);

// Register helper for canonical URL
hexo.extend.helper.register("canonical_url", function (lang?: string) {
  let path = this.page.path;
  if (lang && lang !== "en") path = lang + "/" + path;
  return hutil.full_url_for(path);
});

// Register helper for URL with language
hexo.extend.helper.register("url_for_lang", function (path: string) {
  const lang = this.page.lang;
  let url = this.url_for(path);

  if (lang !== "en" && url[0] === "/") url = "/" + lang + url;

  return url;
});

// Register helper to get the name of the language
hexo.extend.helper.register("lang_name", function (lang: string) {
  const data = (this as any).site.data.languages[lang];
  return data.name || data;
});

// Register filter to modify template locals
hexo.extend.filter.register("template_locals", function (locals: any) {
  const { page } = locals;
  if (page.archive) page.title = "Archive";
});

// Register helper to parse table of contents
hexo.extend.helper.register("parseToc", function (content: string) {
  if (typeof content === "string") {
    const parseTOC = ($: cheerio.CheerioAPI) => {
      const toc: { title: string; link: string; subItems: any[] }[] = [];
      const stack: { level: number; item: any }[] = [];

      $("h1, h2, h3, h4, h5, h6").each((_, element) => {
        const heading = $(element);
        const title = heading.text().trim();
        const link = `#${title.toLowerCase().replace(/\s+/g, "-")}`;
        const level = parseInt(heading.prop("tagName").charAt(1), 10);

        const item = { title, link, subItems: [] };

        while (stack.length > 0 && level <= stack[stack.length - 1].level) {
          stack.pop();
        }

        if (stack.length === 0) {
          toc.push(item);
        } else {
          stack[stack.length - 1].item.subItems.push(item);
        }

        stack.push({ level, item });
      });

      return toc;
    };
    const cacheKey = "parseToc-" + md5(content);
    const cacheValue = hexoThemesCache.get<ReturnType<typeof parseTOC>>(cacheKey, []);
    if (cacheValue.length > 0) return cacheValue;

    const $ = cheerio.load(content);
    const result = parseTOC($);
    hexoThemesCache.set(cacheKey, result);
    return result;
  }
  return [{ error: "Cannot parse table of content" }];
});
