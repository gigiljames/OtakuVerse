const getPage = async (req, res) => {
  try {
    res.render("admin/walletManagement/wallet-list");
  } catch (error) {
    console.log(error);
    console.log("ERROR : Wallet Management Get Page");
  }
};

module.exports = {
  getPage,
};
