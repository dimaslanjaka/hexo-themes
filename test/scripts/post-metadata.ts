import hpp from "hexo-post-parser";
import { renderMarkdownIt } from "hexo-post-parser/dist/markdown/toHtml";
import path from "path";

const fixture = path.join(__dirname, "../../source/_posts/Typography and tags.md");
const parse = hpp.parsePostFM(fixture);
const html = renderMarkdownIt(parse.body);
console.log(html);
