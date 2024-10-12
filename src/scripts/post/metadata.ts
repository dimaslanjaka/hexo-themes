import { load } from "cheerio";
import hexoPostParser, { postMap } from "hexo-post-parser";
import { renderMarkdownIt } from "hexo-post-parser/dist/markdown/toHtml";
import { url_for } from "hexo-util";
import path from "path";
import sanitize from "sanitize-filename";
import { fs, jsonParseWithCircularRefs, jsonStringifyWithCircularRefs, md5, md5FileSync } from "sbg-utility";
import { HexoPageSchema } from "../../types/post";
import getHexoArgs from "../utils/args";
import { saveAsSearch } from "./search";

hexoPostParser.setConfig(hexo.config);

/**
 * Defines the callback type for the preprocess function.
 */
type PreprocessCallback = (
  err: Error | null,
  data: { result: postMap & Record<string, any>; cachePath: string } | null
) => void;

// Queue to hold the pages to be processed
const pageQueue: HexoPageSchema[] = [];
let isProcessing = false;

function getCachePath(page: HexoPageSchema) {
  let hash = "empty-hash";
  if (page && "full_source" in page && page.full_source) md5FileSync(page.full_source);
  if (hash === "empty-hash") {
    if (page.content) {
      hash = md5(page.content);
    } else if (page._content) {
      hash = md5(page._content);
    }
  }
  const result = path.join(
    process.cwd(),
    "tmp",
    "metadata",
    hexo.config.theme,
    "post-" + sanitize((page.title || new String(page._id)).substring(0, 100) + "-" + hash)
  );
  fs.ensureDirSync(path.dirname(result));
  return result;
}

/**
 * Preprocess a page and save its parsed result to a cache file
 *
 * @param page - The page object to be processed.
 * @param callback - The callback that handles the result or error.
 */
export function metadataProcess(page: HexoPageSchema, callback: PreprocessCallback) {
  if (!page.full_source) {
    hexo.log.warn("fail parse metadata from", page.title || page.subtitle || page.permalink);
    return;
  }

  const cachePath = getCachePath(page);
  if (fs.existsSync(cachePath) && getHexoArgs() === "generate") {
    // skip already parsed metadata
    return;
  }

  hexoPostParser
    .parsePost(page.full_source, { fix: true })
    .then((result: postMap) => {
      if (!result.metadata) return;
      // Remove keys with undefined or null values
      const keys = Object.keys(result.metadata);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (result.metadata[key] === undefined || result.metadata[key] === null) {
          delete result.metadata[key];
        }
      }
      if (!result.metadata.permalink && page.permalink) {
        result.metadata.permalink = url_for.bind(hexo)(page.path);
      }
      try {
        fs.writeFileSync(cachePath, jsonStringifyWithCircularRefs(result));
        callback(null, { result, cachePath }); // Pass cachePath in the callback
      } catch (error) {
        hexo.log.error("fail save post info", error.message);
        if (fs.existsSync(cachePath)) fs.rm(cachePath, { force: true, recursive: true });
        callback(error as Error, null); // Invoke callback on error
      }
    })
    .catch((_err: Error) => {
      try {
        if (page.full_source) {
          const parse = hexoPostParser.parsePostFM(page.full_source);
          if (parse.attributes) {
            const html = renderMarkdownIt(parse.body);
            const $ = load(html);
            if (!parse.attributes.description) parse.attributes.description = $.text().slice(0, 150);
            if (!parse.attributes.thumbnail) {
              parse.attributes.thumbnail =
                "https://rawcdn.githack.com/dimaslanjaka/public-source/6a0117ddb2ea327c80dbcc7327cceca1e1b7794e/images/no-image-svgrepo-com.svg";
              const imgTags = $("img").filter((i, el) => {
                const src = $(el).attr("src");
                return typeof src === "string" && src.trim() !== "";
              });

              // Get a random img tag
              if (imgTags.length > 0) {
                const randomIndex = Math.floor(Math.random() * imgTags.length);
                const randomImgSrc = $(imgTags[randomIndex]).attr("src");
                parse.attributes.thumbnail = randomImgSrc;
              } else {
                parse.attributes.thumbnail =
                  "https://rawcdn.githack.com/dimaslanjaka/public-source/6a0117ddb2ea327c80dbcc7327cceca1e1b7794e/images/no-image-svgrepo-com.svg";
              }
            }
            if (!parse.attributes.permalink) {
              if (page.permalink) {
                parse.attributes.permalink = page.permalink;
              } else {
                // const parsePermalink = hexoPostParser.parsePermalink(page.full_source as string, hexo.config as any);
                // if (parsePermalink && parsePermalink.length > 0) parse.attributes.permalink = parsePermalink;
              }
            }
            const result = { metadata: parse.attributes, rawbody: parse.body };
            // Remove keys with undefined or null values
            const keys = Object.keys(result.metadata);
            for (let i = 0; i < keys.length; i++) {
              const key = keys[i];
              if (result.metadata[key] === undefined || result.metadata[key] === null) {
                delete result.metadata[key];
              }
            }
            try {
              fs.writeFileSync(cachePath, jsonStringifyWithCircularRefs(result));
              callback(null, { result, cachePath }); // Pass cachePath in the callback
            } catch (error) {
              hexo.log.error("fail save post info", error.message);
              if (fs.existsSync(cachePath)) fs.rm(cachePath, { force: true, recursive: true });
              callback(error as Error, null); // Invoke callback on error
            }
          }
        }
      } catch (err) {
        callback(new Error("fallback metadata failed: " + err.message), null); // Catch parsePost errors
      }
    });
}

/**
 * Schedule the processing of pages one by one.
 */
function scheduleProcessing(): void {
  if (isProcessing || pageQueue.length === 0) {
    return; // If already processing or no items in the queue, exit
  }

  isProcessing = true;
  const page = pageQueue.shift(); // Get the first item in the queue

  if (page) {
    metadataProcess(page, (err, data) => {
      if (err) {
        hexo.log.error("Error processing page:", err.message);
      } else {
        isProcessing = false;
        if (data?.result && data.result.metadata) {
          saveAsSearch({
            url: data.result.metadata.permalink || "",
            title: data.result.metadata.title || "",
            description: data.result.metadata.description || ""
          });
        }
        setTimeout(scheduleProcessing, 500); // Continue to next item after delay (optional)
      }
    });
  }
}

/**
 * Add pages to the queue and start processing.
 *
 * @param page - The page object to be added to the queue.
 */
function addToQueue(page: HexoPageSchema): void {
  pageQueue.push(page);
  scheduleProcessing(); // Start processing if not already running
}

export const metadataHelper = (page: HexoPageSchema) => {
  addToQueue(page);
  const cachePath = getCachePath(page);
  if (fs.existsSync(cachePath)) {
    try {
      const result = jsonParseWithCircularRefs<HexoPageSchema>(fs.readFileSync(cachePath, "utf-8"));
      if (result && result.metadata) {
        // Assign values to the page object if they exist and are not undefined or null
        for (const key in result.metadata) {
          if (["type"].includes(key)) continue;
          if (Object.hasOwnProperty.call(result.metadata, key)) {
            const value = result.metadata[key];
            if (value !== undefined && value !== null && !page[key]) {
              // fix: thumbnail always undefined
              if (key === "cover" && value.includes("no-image-svgrepo")) continue;
              if (key === "thumbnail" && value.includes("no-image-svgrepo")) continue;
              page[key] = value;
            }
          }
        }
      }
    } catch (error) {
      hexo.log.error("fail load post info", error.message);
    }
  }
  return page; // Return the original page for now
};

hexo.extend.helper.register("pageInfo", metadataHelper);
