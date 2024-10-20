import { load } from "cheerio";
import hpp from "hexo-post-parser";
import { url_for } from "hexo-util";
import path from "path";
import sanitize from "sanitize-filename";
import { fs, jsonParseWithCircularRefs, jsonStringifyWithCircularRefs, md5, md5FileSync } from "sbg-utility";
import { HexoPageSchema } from "../../types/post";
import getHexoArgs from "../utils/args";
import { saveAsSearch } from "./search";

hpp.setConfig(hexo.config);

/**
 * Defines the callback type for the preprocess function.
 */
type PreprocessCallback = (
  err: Error | null,
  data: { result: hpp.postMap & Record<string, any>; cachePath: string } | null
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
export async function metadataProcess(page: HexoPageSchema, callback: PreprocessCallback) {
  if (!page.full_source) {
    hexo.log.warn("fail parse metadata from", page.title || page.subtitle || page.permalink);
    return;
  }

  const cachePath = getCachePath(page);
  if (fs.existsSync(cachePath) && getHexoArgs() === "generate") {
    return; // Skip if already parsed
  }

  const cleanMetadata = (metadata: any) => {
    Object.keys(metadata).forEach((key) => {
      if (metadata[key] == null) delete metadata[key];
    });
  };

  const handleResult = async (result: hpp.postMap) => {
    if (!result.metadata) return;
    cleanMetadata(result.metadata);

    if (!result.metadata.permalink && page.permalink) {
      result.metadata.permalink = url_for.bind(hexo)(page.path);
    }

    try {
      await fs.promises.writeFile(cachePath, jsonStringifyWithCircularRefs(result));
      callback(null, { result, cachePath });
    } catch (error) {
      hexo.log.error("fail save post info", error.message);
      if (fs.existsSync(cachePath)) await fs.promises.rm(cachePath, { force: true, recursive: true });
      callback(error as Error, null);
    }
  };

  try {
    const result = await hpp.parsePost(page.full_source, { fix: true, cache: true });
    await handleResult(result);
  } catch (_error) {
    try {
      if (page.full_source) {
        const parse = await hpp.parsePost(page.full_source);
        if (parse.attributes) {
          const html = hpp.renderMarked(parse.body);
          const $ = load(html);

          if (!parse.attributes.description) {
            parse.attributes.description = $.text().slice(0, 150);
          }

          if (!parse.attributes.thumbnail) {
            parse.attributes.thumbnail =
              "https://rawcdn.githack.com/dimaslanjaka/public-source/6a0117ddb2ea327c80dbcc7327cceca1e1b7794e/images/no-image-svgrepo-com.svg";
            const imgTags = $("img").filter((i, el) => $(el).attr("src")?.trim() !== "");

            if (imgTags.length > 0) {
              const randomIndex = Math.floor(Math.random() * imgTags.length);
              parse.attributes.thumbnail = $(imgTags[randomIndex]).attr("src");
            }
          }

          if (!parse.attributes.permalink && page.permalink) {
            parse.attributes.permalink = page.permalink;
          }

          const result = { metadata: parse.attributes, rawbody: parse.body };
          cleanMetadata(result.metadata);

          try {
            await fs.promises.writeFile(cachePath, jsonStringifyWithCircularRefs(result));
            callback(null, { result, cachePath });
          } catch (error) {
            hexo.log.error("fail save post info", error.message);
            if (fs.existsSync(cachePath)) await fs.promises.rm(cachePath, { force: true, recursive: true });
            callback(error as Error, null);
          }
        }
      }
    } catch (err) {
      callback(new Error("fallback metadata failed: " + err.message), null);
    }
  }
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
