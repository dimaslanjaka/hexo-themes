import { HexoPageSchema } from "../../types/post";

interface Label {
  name: string;
  permalink: string;
}

export function getKeywords(page: HexoPageSchema) {
  const results = [] as string[];
  if (page.keywords && Array.isArray(page.keywords)) return page.keywords;
  if (page.tags) {
    if (typeof page.tags.each === "function") {
      page.tags.each((label: Label) => {
        results.push(label.name);
      });
    } else if (Array.isArray(page.tags)) {
      results.push(...page.tags);
    }
  }
  if (page.categories) {
    if (typeof page.categories.each === "function") {
      page.categories.each((label: Label) => {
        results.push(label.name);
      });
    } else if (Array.isArray(page.categories)) {
      results.push(...page.categories);
    }
  }
  return results;
}

hexo.extend.helper.register("getKeywords", getKeywords);
