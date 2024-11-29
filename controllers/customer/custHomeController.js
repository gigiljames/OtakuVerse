const Customer = require("../../models/customerModel");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");

const getPage = async (req, res) => {
  try {
    let displayData = [];
    const categoryList = await Category.find(
      { is_deleted: false, is_enabled: true },
      { category_name: 1 }
    );
    for (let i = 0; i < categoryList.length; i++) {
      let temp = {};
      let productList = await Product.find({
        category: categoryList[i]._id,
        is_deleted: false,
        is_enabled: true,
      }).limit(4);
      if (productList.length > 0) {
        temp.categoryInfo = categoryList[i];
        temp.productList = productList;
        displayData.push(temp);
      }
    }
    // console.log(displayData);
    if (req.session.user) {
      const customer = await Customer.findById(req.session.user);
      return res.render("customer/home/cust-home", {
        customerData: customer,
        displayData: displayData,
      });
    }
    return res.render("customer/home/cust-home", { displayData });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Customer Home");
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((error) => {
      if (error) {
        console.log(error);
        console.log("ERROR : Customer logout");
      } else {
        return res.redirect("/login");
      }
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Customer Logout");
  }
};

module.exports = {
  getPage,
  logout,
};
