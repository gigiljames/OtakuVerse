document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", function (e) {
    const toggleBtn = e.target.closest(".toggle-password");
    if (!toggleBtn) return;

    let input = null;
    const targetId = toggleBtn.getAttribute("data-target") || toggleBtn.getAttribute("data-target-id");
    if (targetId) {
      input = document.getElementById(targetId);
    }
    if (!input && toggleBtn.parentElement) {
      input = toggleBtn.parentElement.querySelector("input");
    }

    if (input) {
      if (input.type === "password") {
        input.type = "text";
        toggleBtn.textContent = "visibility";
        toggleBtn.setAttribute("aria-label", "Hide password");
      } else {
        input.type = "password";
        toggleBtn.textContent = "visibility_off";
        toggleBtn.setAttribute("aria-label", "Show password");
      }
    }
  });
});
