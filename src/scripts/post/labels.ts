import { PageSchema } from "hexo/dist/types";

interface Label {
  name: string;
  permalink: string;
}

export function getKeywords(page: PageSchema & Record<string, any>) {
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
