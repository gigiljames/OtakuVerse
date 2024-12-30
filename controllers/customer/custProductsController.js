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
      .populate("category", "category_name offer")
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
    }).populate("category");
    const plainRecommendedList = recommendedData.map((product) =>
      product.toObject()
    );
    plainRecommendedList.forEach((product) => {
      let highestOffer =
        product.discount > product.category.offer
          ? product.discount
          : product.category.offer;
      let offerPrice = (product.price * (1 - highestOffer / 100)).toFixed(2);
      product.offer_price = offerPrice;
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
      const plainProduct = product.toObject();
      let highestOffer =
        plainProduct.discount > plainProduct.category.offer
          ? plainProduct.discount
          : plainProduct.category.offer;
      let offerPrice = (plainProduct.price * (1 - highestOffer / 100)).toFixed(
        2
      );
      plainProduct.offer_price = offerPrice;
      plainProduct.applied_discount = highestOffer;
      if (req.session.user) {
        return res.render("customer/product/cust-product-details", {
          product: plainProduct,
          ratingAvg,
          reviews,
          recommendedData: plainRecommendedList,
        });
      } else {
        return res.render("customer/product/cust-product-details", {
          product: plainProduct,
          ratingAvg,
          reviews,
          recommendedData: plainRecommendedList,
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
    let { category } = req.query;
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
    let query = {
      $or: [
        { product_name: { $regex: search, $options: "i" } },
        { product_desc: { $regex: search, $options: "i" } },
        { product_specs: { $regex: search, $options: "i" } },
      ],
      is_enabled: true,
      is_deleted: false,
    };
    if (category) {
      category = category.split(" ");
      query.category = category;
    }
    const productList = await Product.find(query)
      .sort(sortOptions)
      .collation({ locale: "en", strength: 2 })
      .populate("category");
    const plainProductList = productList.map((product) => product.toObject());
    plainProductList.forEach((product) => {
      let highestOffer =
        product.discount > product.category.offer
          ? product.discount
          : product.category.offer;
      let offerPrice = (product.price * (1 - highestOffer / 100)).toFixed(2);
      product.offer_price = offerPrice;
    });
    // console.log(plainProductList);

    res.json({ success: true, productList: plainProductList });
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
