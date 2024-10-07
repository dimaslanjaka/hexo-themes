"use strict";

const cheerio = require("cheerio");

hexo.extend.helper.register("getPosts", function () {
  const self = this;
  const { page } = self;
  return page.posts;
});

hexo.extend.helper.register("getLanguage", function (page) {
  let lang;
  if ("lang" in page) {
    lang = page.lang;
  } else if ("language" in page) {
    lang = page.language;
  } else if ("lang" in hexo.config) {
    lang = hexo.config.lang;
  } else if ("language" in hexo.config) {
    lang = hexo.config.language;
  }
  if (typeof lang == "string") {
    return lang;
  } else if (Array.isArray(lang)) {
    return lang[0];
  }
  return "en";
});

hexo.extend.helper.register(
  "getPostByLabel",
  /**
   * hexo get post by key with name
   * @param {'tags'|'categories'} by
   * @param {string[]} filternames
   * @returns {Record<string, string>[]}
   */
  function (by, filternames) {
    const hexo = this;
    /**
     * @type {any[]}
     */
    const data = hexo.site[by].data;
    const map = filternames
      .map((filtername) => {
        const filter = data.filter(({ name }) => String(name).toLowerCase() == filtername.toLowerCase());
        return filter.map((group) => {
          return group.posts.map(
            /**
             * @param {import('hexo').Post.Data} post
             */
            function ({ title, permalink, thumbnail, photos }) {
              // get title and permalink
              // for more keys, you can look at https://github.com/dimaslanjaka/nodejs-package-types/blob/ec9b509d81eefdfada79f1658ac02118936a1e5a/index.d.ts#L757-L762
              return { title, permalink, thumbnail, photos };
            }
          );
        });
      })
      // flattern all multidimensional arrays
      // to get array of hexo post object
      .flat(2);
    // dump
    // console.log(map);
    // return an JSON string
    // return JSON.stringify(map, null, 2);
    // return an Array
    return map;
  }
);

/**
 * Returns a JSON stringified version of the value, safe for inclusion in an
 * inline <script> tag. The optional argument 'spaces' can be used for
 * pretty-printing.
 *
 * Output is NOT safe for inclusion in HTML! If that's what you need, use the
 * built-in 'dump' filter instead.
 *
 * @example
 * {{ json_stringify(data, 2) }}
 */
hexo.extend.helper.register("json_stringify", function (value, spaces) {
  const nunjucks = require("nunjucks");
  if (value instanceof nunjucks.runtime.SafeString) {
    value = value.toString();
  }
  const jsonString = JSON.stringify(value, null, spaces).replace(/</g, "\\u003c");
  return nunjucks.runtime.markSafe(jsonString);
});

hexo.extend.helper.register("object_keys", function (obj) {
  return Object.keys(obj);
});

hexo.extend.helper.register("is_array", function (obj) {
  return Array.isArray(obj);
});

/**
 * fix url
 * - remove double slashes
 * - decode url
 * @param {string} url
 * @param {Record<string,any>} options
 * @returns
 */
function fixURL(url, options = {}) {
  const fixed = url.replace(/([^:]\/)\/+/gm, "$1");
  if (options) {
    if (options.decode) return decodeURI(fixed);
  }
  return fixed;
}

hexo.extend.helper.register("fixURL", fixURL);

hexo.extend.helper.register("canonical_url", function (lang) {
  let path = this.page.path;
  if (lang && lang !== "en") path = lang + "/" + path;
  const util = require("hexo-util");
  return util.full_url_for(path);
});

hexo.extend.helper.register("url_for_lang", function (path) {
  const lang = this.page.lang;
  let url = this.url_for(path);

  if (lang !== "en" && url[0] === "/") url = "/" + lang + url;

  return url;
});

hexo.extend.helper.register("lang_name", function (lang) {
  const data = this.site.data.languages[lang];
  return data.name || data;
});

hexo.extend.filter.register("template_locals", function (locals) {
  const { page } = locals;
  if (page.archive) page.title = "Archive";
});

hexo.extend.helper.register("parseToc", function (content) {
  if (typeof content === "string") {
    const $ = cheerio.load(content);

    // Function to extract TOC
    const parseTOC = () => {
      const toc = [];
      const stack = []; // Stack to manage current levels

      // Loop through h1 to h6 tags to create TOC
      $("h1, h2, h3, h4, h5, h6").each((_, element) => {
        const heading = $(element);
        const title = heading.text().trim(); // Trim the title
        const link = `#${title.toLowerCase().replace(/\s+/g, "-")}`; // Create an anchor link based on title
        const level = parseInt(heading.prop("tagName").charAt(1)); // Get the heading level (h1 -> 1, h2 -> 2, ...)

        const item = { title, link, subItems: [] };

        // Manage the current level for nesting
        while (stack.length > 0 && level <= stack[stack.length - 1].level) {
          stack.pop(); // Go up a level
        }

        if (stack.length === 0) {
          toc.push(item); // Push to the root level if the stack is empty
        } else {
          stack[stack.length - 1].item.subItems.push(item); // Add to the last level's subItems
        }

        // Add the new item to the stack with its level
        stack.push({ level, item });
      });

      return toc;
    };

    return parseTOC(); // Return the generated TOC
  }
  // Return an array of error object if content is not a string
  return [{ error: "Cannot parse table of content" }];
});
