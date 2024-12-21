document.addEventListener("DOMContentLoaded", () => {
  // BURGER MENU

  const menu = document.getElementById("menu");
  const burgerIcon1 = document.getElementById("burger-menu");
  const burgerIcon2 = document.getElementById("burger-menu2");

  burgerIcon1.addEventListener("click", (event) => {
    menu.style.display = "block";
  });

  burgerIcon2.addEventListener("click", (event) => {
    menu.style.display = "none";
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
