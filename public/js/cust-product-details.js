// IMAGE SELECTION HANDLER

const imageTileList = document.getElementsByClassName("image-tile");
const displayImage = document.getElementById("display-image");
const src = imageTileList[0].getAttribute("src");
displayImage.setAttribute("src", src);
for (let i = 0; i < imageTileList.length; i++) {
  imageTileList[i].addEventListener("click", (event) => {
    const src = imageTileList[i].getAttribute("src");
    displayImage.setAttribute("src", src);
  });
}
