/**
 * get author name
 * @param {string|Record<string, any>} author
 * @returns
 */
function getAuthorName(author) {
  if (typeof author === "string") return author;
  if (author && typeof author === "object" && !Array.isArray(author)) {
    if (typeof author.name === "string") return author.name;
    if (typeof author.nick === "string") return author.nick;
    if (typeof author.nickname === "string") return author.nickname;
  }
}

hexo.extend.helper.register("getAuthorName", function (author, fallback) {
  const resultAuthor = getAuthorName(author);
  if (resultAuthor) return resultAuthor;
  const resultFallback = getAuthorName(fallback);
  if (resultFallback) return resultFallback;
  return getAuthorName(hexo.config.author) || "Unknown";
});
