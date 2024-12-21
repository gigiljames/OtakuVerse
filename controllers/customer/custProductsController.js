const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const ProductReview = require("../../models/productReviewModel");

async function getCategoryList() {
  const categoryList = await Category.find(
    { is_deleted: false, is_enabled: true },
    { category_name: 1 }
  );
  return categoryList;
}

const viewProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate("category", "category_name")
      .populate("variants");

    const reviews = await ProductReview.find({ product_id: id }).populate(
      "customer_id",
      "customer_name"
    );
    const recommendedData = await Product.find({
      _id: { $ne: id },
      category: product.category,
      is_deleted: false,
      is_enabled: true,
    });
    const ratingSum = reviews.reduce((accumulator, value) => {
      accumulator = accumulator + Number(value.rating);
      return accumulator;
    }, 0);
    let ratingAvg = ratingSum / reviews.length;
    if (isNaN(ratingAvg)) {
      ratingAvg = "Unrated";
    }
    if (product) {
      if (req.session.user) {
        return res.render("customer/product/cust-product-details", {
          product,
          ratingAvg,
          reviews,
          recommendedData,
        });
      } else {
        return res.render("customer/product/cust-product-details", {
          product,
          ratingAvg,
          reviews,
          recommendedData,
          isLoggedOut: true,
        });
      }
    }
    return res.send("Product doesn't exist");
  } catch (error) {
    console.log(error);
    console.log("ERROR : View Product");
  }
};

const getShopPage = async (req, res) => {
  try {
    const categoryList = await getCategoryList();
    res.render("customer/product/cust-shop", { categoryList });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Shop Page");
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, sort } = req.query;
    let sortOptions = {};
    switch (sort) {
      case "popularity":
        sortOptions.popularity = 1;
        break;
      case "ascprice":
        sortOptions.discounted_price = 1;
        break;
      case "descprice":
        sortOptions.discounted_price = -1;
        break;
      case "avgrating":
        sortOptions.rating = 1;
        break;
      case "featured":
        console.log("featured sorting");
        break;
      case "new":
        sortOptions.createdAt = -1;
        break;
      case "ascname":
        sortOptions.product_name = 1;
        break;
      case "descname":
        sortOptions.product_name = -1;
        break;
    }
    const productList = await Product.find({
      $or: [
        { product_name: { $regex: search, $options: "i" } },
        { product_desc: { $regex: search, $options: "i" } },
        { product_specs: { $regex: search, $options: "i" } },
      ],
      is_enabled: true,
      is_deleted: false,
    })
      .sort(sortOptions)
      .collation({ locale: "en", strength: 2 });
    console.log(productList);
    res.json({ success: true, productList });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Products");
  }
};

module.exports = {
  viewProduct,
  getShopPage,
  getProducts,
};
