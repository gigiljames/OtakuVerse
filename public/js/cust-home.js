document.addEventListener("DOMContentLoaded", () => {
  const burgerIcon1 = document.getElementById("burger-menu");
  if (burgerIcon1) {
    burgerIcon1.click();
  }
});

const swiper = new Swiper(".swiper", {
  direction: "horizontal",
  loop: true,
  autoplay: true,
  speed: 1500,
  delay: 8000,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  scrollbar: {
    el: ".swiper-scrollbar",
  },
});
