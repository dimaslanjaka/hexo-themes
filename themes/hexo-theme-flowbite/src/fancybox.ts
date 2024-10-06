import { Fancybox } from "@fancyapps/ui";

export default function initFancybox() {
  const wrapper = document.querySelector<HTMLElement>(".post");
  document.querySelectorAll("img").forEach((el) => {
    if (!el.hasAttribute("data-caption")) {
      let caption = "";
      caption += el.getAttribute("title") || "";
      if (caption.trim().length > 0) caption += " - ";
      caption += el.getAttribute("alt") || "";
      el.setAttribute("data-caption", caption);
    }
    if (!el.hasAttribute("data-fancybox")) el.setAttribute("data-fancybox", "true");
  });
  Fancybox.bind(wrapper, "[data-fancybox=true]", {
    // Your custom options
  });
}
