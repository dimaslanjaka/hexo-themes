import hexoPostParser, { postMap } from "hexo-post-parser";
import path from "path";
import sanitize from "sanitize-filename";
import { fs, jsonParseWithCircularRefs, jsonStringifyWithCircularRefs, md5 } from "sbg-utility";
import { HexoPageSchema } from "../../types/post";

hexoPostParser.setConfig(hexo.config);

/**
 * Defines the callback type for the preprocess function.
 */
type PreprocessCallback = (err: Error | null, data: { result: postMap; cachePath: string } | null) => void;

// Queue to hold the pages to be processed
const pageQueue: HexoPageSchema[] = [];
let isProcessing = false;

function getCachePath(page: HexoPageSchema) {
  return path.join(
    process.cwd(),
    "tmp/hexo-theme-flowbite/caches/post-" +
      sanitize((page.title || new String(page._id)).substring(0, 100) + "-" + md5(page.content || page._content))
  );
}

/**
 * Preprocess a page and save its parsed result to a cache file
 *
 * @param page - The page object to be processed.
 * @param callback - The callback that handles the result or error.
 */
function preprocess(page: HexoPageSchema, callback: PreprocessCallback): void {
  const cachePath = getCachePath(page);

  fs.ensureDirSync(path.dirname(cachePath));

  hexoPostParser
    .parsePost(page.full_source, { fix: true })
    .then((result: postMap) => {
      // Remove keys with undefined or null values
      Object.keys(result.metadata).forEach((key) => {
        if (result.metadata[key] === undefined || result.metadata[key] === null) {
          delete result.metadata[key];
        }
      });
      try {
        fs.writeFileSync(cachePath, jsonStringifyWithCircularRefs(result));
        callback(null, { result, cachePath }); // Pass cachePath in the callback
      } catch (error) {
        hexo.log.error("fail save post info", (error as Error).message);
        callback(error as Error, null); // Invoke callback on error
      }
    })
    .catch((err: Error) => {
      callback(err, null); // Catch parsePost errors
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
    preprocess(page, (err, _data) => {
      if (err) {
        hexo.log.error("Error processing page:", err.message);
      } else {
        isProcessing = false;
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

hexo.extend.helper.register("pageInfo", (page: HexoPageSchema) => {
  addToQueue(page);
  const cachePath = getCachePath(page);
  if (fs.existsSync(cachePath)) {
    try {
      const extract = jsonParseWithCircularRefs(fs.readFileSync(cachePath, "utf-8"));
      return extract;
    } catch (error) {
      hexo.log.error("fail load post info", error.message);
    }
  }
  return page; // Return the original page for now
});
