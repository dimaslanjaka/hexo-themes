const { url_for } = require("hexo-util");

/**
 * get thumbnail url
 * @param {import("hexo/dist/hexo/locals-d").HexoLocalsData} page
 */
function getThumbnail(page) {
  if (page && typeof page === "object") {
    if (typeof page.thumbnail === "string") return page.thumbnail;
    if (Array.isArray(page.photos)) {
      console.log(page.photos);
      if (typeof page.photos[0] === "string") return page.photos[0];
    }
  }
}

hexo.extend.helper.register("getThumbnail", function (page) {
  const result = getThumbnail(page);
  if (result) {
    if (result.startsWith("/")) return url_for(result);
    return result;
  }
  return "https://rawcdn.githack.com/dimaslanjaka/public-source/6a0117ddb2ea327c80dbcc7327cceca1e1b7794e/images/no-image-svgrepo-com.svg";
});
