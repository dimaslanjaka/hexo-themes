"use strict";

import * as cheerio from "cheerio";
import Hexo from "hexo";
import * as hutil from "hexo-util";
import nunjucks from "nunjucks";
import { md5 } from "sbg-utility";
import { hexoThemesCache } from "./utils/cache";

// Register helper to get posts from the current page
hexo.extend.helper.register("getPosts", function (this: Hexo) {
  const { page } = this as unknown as { page: { posts: any[] } };
  return page.posts;
} as unknown as any);

// Register helper to get the language setting
hexo.extend.helper.register("getLanguage", function (this: Hexo, page: any): string {
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
} as unknown as any);

// Register helper to get posts by label
hexo.extend.helper.register(
  "getPostByLabel",
  /**
   * Get posts by key with name.
   * @param by - The key to filter by ('tags' or 'categories').
   * @param filternames - Array of filter names.
   * @returns Array of posts matching the filters.
   */
  function (this: Hexo, by: "tags" | "categories", filternames: string[]): Record<string, string>[] {
    const hexo = this as unknown as Record<string, any>;
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
  } as unknown as any
);

// Register JSON stringification helper
hexo.extend.helper.register("json_stringify", function (value: any, spaces?: number) {
  if (value instanceof nunjucks.runtime.SafeString) {
    value = value.toString();
  }
  const jsonString = JSON.stringify(value, null, spaces).replace(/</g, "\\u003c");
  return new nunjucks.runtime.SafeString(jsonString);
} as unknown as any);

// Register helper to get object keys
hexo.extend.helper.register("object_keys", function (obj: Record<string, any>) {
  return Object.keys(obj);
} as unknown as any);

// Register helper to check if an object is an array
hexo.extend.helper.register("is_array", function (obj: any) {
  return Array.isArray(obj);
} as unknown as any);

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

hexo.extend.helper.register("fixURL", fixURL as unknown as any);

// Register helper for canonical URL
hexo.extend.helper.register("canonical_url", function (this: Hexo, lang?: string) {
  const hexo = this as unknown as Record<string, any>;
  let path = hexo.page.path;
  if (lang && lang !== "en") path = lang + "/" + path;
  return hutil.full_url_for(path);
} as unknown as any);

// Register helper for URL with language
hexo.extend.helper.register("url_for_lang", function (this: Hexo, path: string) {
  const hexo = this as unknown as Record<string, any>;
  const lang = hexo.page.lang;
  let url = hexo.url_for(path);

  if (lang !== "en" && url[0] === "/") url = "/" + lang + url;

  return url;
} as unknown as any);

// Register helper to get the name of the language
hexo.extend.helper.register("lang_name", function (this: Hexo, lang: string) {
  const data = (this as any).site.data.languages[lang];
  return data.name || data;
} as unknown as any);

// Register filter to modify template locals
hexo.extend.filter.register("template_locals", function (this: Hexo, locals: any) {
  const { page } = locals;
  if (page.archive) page.title = "Archive";
} as unknown as any);

// Register helper to parse table of contents
hexo.extend.helper.register("parseToc", function (this: Hexo, content: string) {
  if (typeof content === "string") {
    const parseTOC = ($: cheerio.CheerioAPI) => {
      const toc: { title: string; link: string; subItems: any[] }[] = [];
      const stack: { level: number; item: any }[] = [];

      $("h1, h2, h3, h4, h5, h6").each((_, element) => {
        const heading = $(element);
        const title = heading.text().trim();
        const link = `#${title.toLowerCase().replace(/\s+/g, "-")}`;

        const tagName = heading.prop("tagName");

        // Skip invalid headings
        if (!tagName) return;

        const level = parseInt(tagName.charAt(1), 10);

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
} as unknown as any);
