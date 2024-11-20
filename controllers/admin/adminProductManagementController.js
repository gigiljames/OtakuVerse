const getPage = async (req, res) => {
  res.render("admin/productManagement/product-list");
};

const viewProduct = async (req, res) => {
  res.render("admin/productManagement/view-product");
};

module.exports = {
  getPage,
  viewProduct,
};
