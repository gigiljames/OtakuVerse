document.addEventListener("DOMContentLoaded", () => {
  const burgerIcon1 = document.getElementById("burger-menu");
  burgerIcon1.click();
  queryProducts(); // Queries products and updates product list
  const searchButton = document.querySelector(".search-button");
  searchButton.addEventListener("click", () => {
    queryProducts();
  });
  const searchInput = document.getElementById("search");
  const clearButton = document.querySelector(".clear-button");
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim() !== "") {
      clearButton.style.display = "block";
    } else {
      clearButton.style.display = "none";
    }
  });
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    clearButton.style.display = "none";
    searchInput.focus();
  });
  const sortButton = document.querySelector(".sort-button");
  sortButton.addEventListener("click", () => {
    queryProducts();
  });
  const filterButton = document.querySelector(".filter-button");
  filterButton.addEventListener("click", () => {
    queryProducts();
  });
});

function queryProducts() {
  const searchQuery = document.querySelector("#search").value.trim() || "";
  const sortOption = document.querySelector("#sort").value.trim() || "";
  const checkedCategories = document.querySelectorAll(
    "input[name='category']:checked"
  );
  let categoryOptions = [];
  checkedCategories.forEach((checked) => {
    categoryOptions.push(checked.value);
  });
  categoryOptions = categoryOptions.join("+");
  $.ajax({
    url: `/get-products?search=${searchQuery}&sort=${sortOption}&category=${categoryOptions}`,
    type: "GET",
    success: function (response) {
      if (response.success) {
        updateProductList(response.productList);
      } else {
        if (response.message) {
          alert(response.message, "error");
        }
        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        }
      }
    },
    error: function (error) {},
  });
}

function updateProductList(products) {
  const productCards = document.querySelector(".product-cards");
  productCards.innerHTML = "";
  products.forEach((product) => {
    let productCard = document.createElement("a");
    const ovPrice = Math.ceil(
      Number(product.price) * (1 - Number(product.discount) / 100)
    );
    let totalStock = 0;
    let stockMessage = "";
    if (product.variants.length > 0) {
      product.variants.forEach((variant) => {
        totalStock += variant.stock_quantity;
      });
      if (totalStock > 0 && totalStock < 10) {
        stockMessage = `${totalStock} Left!!`;
      } else if (totalStock === 0) {
        stockMessage = "Out of stock.";
      }
    } else {
      stockMessage = "Currently unavailable";
    }

    productCard.setAttribute("href", `/product/${product._id}`);
    productCard.innerHTML = `<div class="product-card">
                      <div class="product-image">
                        <img
                          src="${product.product_images[0]?.filepath}"
                          alt="product-image"
                        />
                      </div>
                      <div class="product-title">${product.product_name}</div>
                      <div class="product-rating">
                        <div class="star-rating">⭐⭐⭐⭐⭐</div>
                        <div class="review-count">(3 reviews)</div>
                      </div>
                      <div class="product-pricing">
                        <div class="ov-price">
                          ₹${product.offer_price}
                        </div>
                        <div class="original-price">₹${product.price}</div>
                          
                      </div>
                      <div class="total-stock">
                            ${stockMessage}
                          </div>
                    </div>`;
    productCards.append(productCard);
  });
}
