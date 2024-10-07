/**
 * get author name
 * @param {Partial<string|Record<string, any>|import("hexo/dist/hexo/index-d").HexoConfig>} author
 * @returns
 */
function getAuthorName(author) {
  if (typeof author === "string") return author;
  if (author && typeof author === "object" && !Array.isArray(author)) {
    if (typeof author.name === "string") return author.name;
    if (typeof author.nick === "string") return author.nick;
    if (typeof author.nickname === "string") return author.nickname;
    if (typeof author.author_obj === "object") return getAuthorName(author.author_obj);
  }
}

hexo.extend.helper.register("getAuthorName", function (author, fallback) {
  const resultAuthor = getAuthorName(author);
  if (resultAuthor) return resultAuthor;
  const resultFallback = getAuthorName(fallback);
  if (resultFallback) return resultFallback;
  return getAuthorName(hexo.config) || "Unknown";
});
