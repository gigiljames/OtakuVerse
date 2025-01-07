document.addEventListener("DOMContentLoaded", (event) => {
  const sidebarLinks = document.querySelectorAll(".sidebar a");
  sidebarLinks.forEach((link, index) => {
    if (link.pathname === window.location.pathname) {
      link.classList.add("selected");
    }
  });
});
