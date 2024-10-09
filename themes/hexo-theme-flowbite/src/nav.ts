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
  if (navItems) {
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

      // Add a click event listener to toggle submenu
      link.addEventListener("click", (e) => {
        const submenu = item.querySelector(".absolute");

        if (submenu) {
          // Prevent default navigation behavior if submenu exists
          e.preventDefault();

          // Check if submenu is already visible
          if (submenu.classList.contains("hidden")) {
            // Hide all other open submenus first
            closeAllSubmenus(navItems);

            // Show the current submenu
            submenu.classList.remove("hidden");

            // Toggle the caret icon
            if (icon) {
              icon.classList.remove("fa-caret-down");
              icon.classList.add("fa-caret-up");
            }
          } else {
            // Hide the current submenu if it's already visible
            submenu.classList.add("hidden");

            // Reset the caret icon
            if (icon) {
              icon.classList.remove("fa-caret-up");
              icon.classList.add("fa-caret-down");
            }
          }
        } else {
          // If no submenu exists, follow the link's default behavior
          window.location.href = link.getAttribute("href");
        }
      });
    });
  }

  // Function to close all open submenus
  function closeAllSubmenus(navItems) {
    navItems.forEach((item) => {
      const submenu = item.querySelector(".absolute");
      const icon = item.querySelector("i");

      if (submenu && !submenu.classList.contains("hidden")) {
        submenu.classList.add("hidden");

        if (icon) {
          icon.classList.remove("fa-caret-up");
          icon.classList.add("fa-caret-down");
        }
      }
    });
  }
}
