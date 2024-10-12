import { HexoPageSchema } from "../../types/post";

interface Label {
  name: string;
  permalink: string;
}

export function getKeywords(page: HexoPageSchema) {
  const results = [] as string[];
  if (page.tags) {
    page.tags.each((label: Label) => {
      results.push(label.name);
    });
  }
  if (page.categories) {
    page.categories.each((label: Label) => {
      results.push(label.name);
    });
  }
  return results;
}

hexo.extend.helper.register("getKeywords", getKeywords);
