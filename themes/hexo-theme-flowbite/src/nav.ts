export default function initNavigationMenu() {
  // layout/partials/nav.njk
  const mobileMenuButton = document.querySelector('button[aria-controls="mobile-menu"]');
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuButton && mobileMenu) {
    if (!mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.add("hidden");
    }

    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Handle submenu interactions for desktop
  const navItems = document.querySelectorAll(".relative.group");
  navItems.forEach((item) => {
    const icon = item.querySelector("i");

    item.addEventListener("mouseenter", () => {
      const submenu = item.querySelector(".absolute");
      if (submenu) submenu.classList.remove("hidden");
      if (icon) icon.classList.remove("fa-caret-down");
      if (icon) icon.classList.add("fa-caret-up");
    });

    item.addEventListener("mouseleave", () => {
      const submenu = item.querySelector(".absolute");
      if (submenu) submenu.classList.add("hidden");
      if (icon) icon.classList.remove("fa-caret-up");
      if (icon) icon.classList.add("fa-caret-down");
    });
  });

  // Handle submenu toggle for mobile
  navItems.forEach((item) => {
    const link = item.querySelector("a");
    const icon = item.querySelector("i");

    link.addEventListener("click", (e) => {
      const submenu = item.querySelector(".absolute");
      if (submenu) {
        e.preventDefault(); // Prevent the default action if submenu is available
        submenu.classList.toggle("hidden");
        icon.classList.toggle("fa-caret-up");
        icon.classList.toggle("fa-caret-down");
      }
    });
  });
}
