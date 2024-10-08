export default function initloader() {
  window.addEventListener("load", function () {
    const preloader = document.getElementById("preloader");
    const preloaderMini = document.getElementById("preloader-mini");
    if (preloader) preloader.style.display = "none";
    if (preloaderMini) preloaderMini.style.display = "none";
  });
}
