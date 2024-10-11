import Hexo from "hexo";
import { url_for } from "hexo-util";
import utility from "sbg-utility";

export function fix_url_for(source: string) {
  const instance: Hexo = this instanceof Hexo ? this : hexo;
  const { root = null } = instance.config;
  // skip hash source or global protocol url
  if (source.startsWith("#") || source.startsWith("//")) return source;
  // process non url source
  if (!utility.isValidHttpUrl(source) && root) {
    if (!source.startsWith(root)) return url_for.bind(instance)(source);
    return source;
  }
  return source;
}

hexo.extend.helper.register("urlFor", fix_url_for);
