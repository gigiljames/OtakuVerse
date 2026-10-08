document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("sidebar-toggle");
  const overlay = document.querySelector(".sidebar-overlay");
  const isMobile = () => window.innerWidth <= 768;

  if (!sidebar || !toggleBtn) return;

  if (isMobile()) {
    // Mobile: start collapsed (already in HTML), overlay hidden
    sidebar.classList.add("collapsed");
    if (overlay) overlay.classList.remove("visible");
  } else {
    // Desktop: restore saved preference; default is expanded
    const savedCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    sidebar.classList.toggle("collapsed", savedCollapsed);
  }

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    if (isMobile()) {
      const isOpen = !sidebar.classList.contains("collapsed");
      if (overlay) overlay.classList.toggle("visible", isOpen);
    } else {
      localStorage.setItem("sidebarCollapsed", sidebar.classList.contains("collapsed"));
    }
  });

  // Close on overlay click (mobile)
  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.add("collapsed");
      overlay.classList.remove("visible");
    });
  }

  // Resize: re-apply correct state
  window.addEventListener("resize", () => {
    if (isMobile()) {
      sidebar.classList.add("collapsed");
      if (overlay) overlay.classList.remove("visible");
    } else {
      if (overlay) overlay.classList.remove("visible");
      const savedCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
      sidebar.classList.toggle("collapsed", savedCollapsed);
    }
  });
});
