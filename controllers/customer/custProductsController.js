const Product = require("../../models/productModel");
const ProductReview = require("../../models/productReviewModel");

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
    const ratingSum = reviews.reduce((accumulator, value) => {
      accumulator = accumulator + Number(value.rating);
      return accumulator;
    }, 0);
    let ratingAvg = ratingSum / reviews.length;
    if (isNaN(ratingAvg)) {
      ratingAvg = "Unrated";
    }
    console.log(product);
    if (product) {
      return res.render("customer/product/cust-product-details", {
        product,
        ratingAvg,
        reviews,
      });
    }
    return res.send("Product doesn't exist");
  } catch (error) {
    console.log(error);
    console.log("ERROR : View Product");
  }
};

module.exports = {
  viewProduct,
};
