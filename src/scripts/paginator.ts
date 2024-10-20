"use strict";

hexo.extend.helper.register("next_paginator", function () {
  const { __, paginator: hexoPaginator } = this as any;
  const prev = __("accessibility.prev_page");
  const next = __("accessibility.next_page");
  let paginator = hexoPaginator({
    prev_text: '<i class="fa-solid fa-angle-left"></i>',
    next_text: '<i class="fa-solid fa-angle-right"></i>',
    mid_size: 1,
    escape: false
  });
  paginator = paginator
    .replace('rel="prev"', `rel="prev" title="${prev}" aria-label="${prev}"`)
    .replace('rel="next"', `rel="next" title="${next}" aria-label="${next}"`);
  return paginator;
});
