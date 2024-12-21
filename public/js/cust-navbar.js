// BURGER MENU

document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".sidebar");
  const burgerIcon1 = document.getElementById("burger-menu");
  let isVisible = true;
  burgerIcon1.addEventListener("click", (event) => {
    if (isVisible) {
      menu.classList.remove("sidebar-visible");
      menu.classList.add("sidebar-invisible");
      isVisible = false;
    } else {
      menu.classList.remove("sidebar-invisible");
      menu.classList.add("sidebar-visible");
      isVisible = true;
    }
  });

  //USER MENU
  let userMenuDisplay = false;
  const userMenu = document.getElementById("user-menu");
  const userDp = document.getElementById("user-dp");
  userDp.addEventListener("click", (event) => {
    if (userMenuDisplay) {
      userMenu.style.display = "none";
      userMenuDisplay = false;
    } else {
      userMenu.style.display = "flex";
      userMenuDisplay = true;
    }
  });
});
