const hexoPostParser = require("hexo-post-parser");
const _ = require("lodash");
const path = require("path");
const { md5, fs, jsonStringifyWithCircularRefs, jsonParseWithCircularRefs } = require("sbg-utility");
const sanitize = require("sanitize-filename");

hexoPostParser.setConfig(hexo.config);

/**
 *
 * @param {import("hexo/dist/types").PostSchema|import("hexo/dist/types").PageSchema} page
 */
function preprocess(page) {
  const cachePath = path.join(
    process.cwd(),
    "tmp/hexo-theme-flowbite/caches/post-" +
      sanitize((page.title || page._id) + "-" + md5(page.content || page._content))
  );
  fs.ensureDirSync(path.dirname(cachePath));
  hexoPostParser
    .parsePost(page.full_source, { fix: true })
    .then((result) => {
      // Remove keys with undefined or null values
      Object.keys(result.metadata).forEach((key) => {
        if (result.metadata[key] === undefined || result.metadata[key] === null) {
          delete result.metadata[key];
        }
      });
      try {
        fs.writeFileSync(cachePath, jsonStringifyWithCircularRefs(result));
      } catch (error) {
        hexo.log.error("fail save post info", error.message);
      }
    })
    .catch(_.noop);
  if (fs.existsSync(cachePath)) {
    try {
      const extract = jsonParseWithCircularRefs(fs.readFileSync(cachePath, "utf-8"));
      return extract;
    } catch (error) {
      hexo.log.error("fail load post info", error.message);
    }
  }
}

hexo.extend.helper.register("pageInfo", (page) => {
  const result = preprocess(page);
  if (result && result.metadata) {
    // Assign values to the page object if they exist and are not undefined or null
    for (const key in result.metadata) {
      if (Object.hasOwnProperty.call(result.metadata, key)) {
        const value = result.metadata[key];
        if (value !== undefined && value !== null && !page[key]) {
          page[key] = value;
        }
      }
    }
  }
  return page;
});
