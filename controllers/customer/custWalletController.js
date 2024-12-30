const Wallet = require("../../models/walletModel");
const Category = require("../../models/categoryModel");

async function getCategoryList() {
  const categoryList = await Category.find(
    { is_deleted: false, is_enabled: true },
    { category_name: 1 }
  );
  return categoryList;
}

const getPage = async (req, res) => {
  try {
    const custID = req.session.user;
    const wallet = await Wallet.findOne({ customer_id: custID });
    const categoryList = await getCategoryList();
    console.log(categoryList);
    return res.render("customer/home/cust-wallet", { wallet, categoryList });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Wallet Get Page");
  }
};

module.exports = {
  getPage,
};
