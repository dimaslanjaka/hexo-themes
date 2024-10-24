/* eslint-disable no-useless-escape */
const rUrl =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/;

/**
 * Fancybox tag
 *
 * Syntax:
 *   {% fancybox /path/to/image [/path/to/thumbnail] [title] %}
 */

hexo.extend.tag.register("fancybox", function (args) {
  const original = args.shift();
  let thumbnail = "";

  if (args.length && rUrl.test(args[0])) {
    thumbnail = args.shift();
  }

  const title = args.join(" ");

  return `<a data-fancybox="gallery" href="${original}" data-caption="${title}">
    <img src="${thumbnail || original}" alt="${title}">
    </a>
    ${title ? `<span class="caption">${title}</span>` : ""}`;
});
