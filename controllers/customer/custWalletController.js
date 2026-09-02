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
    let offset = parseInt(req.query.offset) || 1;
    if (offset < 1) {
      offset = 1;
    }
    const limit = 10;

    const wallet = await Wallet.findOne({ customer_id: custID });
    const startPoint = (offset - 1) * limit;
    const reverseTransactionHistory = wallet.transaction_history.reverse();
    const transactionHistory = reverseTransactionHistory.slice(
      startPoint,
      startPoint + limit
    );
    const numberOfPages = Math.ceil(wallet.transaction_history.length / limit);
    const categoryList = await getCategoryList();
    // console.log(categoryList);
    return res.render("customer/home/cust-wallet", {
      wallet,
      categoryList,
      currentURL: "/wallet?",
      offset,
      numberOfPages,
      transactionHistory,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Wallet Get Page");
  }
};

module.exports = {
  getPage,
};
