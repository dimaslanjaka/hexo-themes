import initFancybox from "./fancybox";
import { highlightMain, initClipBoard } from "./highlight";
import initToc from "./toc";

document.addEventListener("DOMContentLoaded", () => {
  highlightMain();
  initClipBoard();
  initFancybox();
  initToc();

  // layout/partials/nav.njk
  const mobileMenuButton = document.querySelector('button[aria-controls="mobile-menu"]');
  const mobileMenu = document.getElementById("mobile-menu");
  if (!mobileMenu.classList.contains("hidden")) {
    mobileMenu.classList.add("hidden");
  }
  mobileMenuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
});
