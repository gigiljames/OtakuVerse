const getPage = async (req, res) => {
  res.render("admin/categoryManagement/category-list");
};

const viewCategory = async (req, res) => {
  res.render("admin/categoryManagement/view-category");
};

module.exports = {
  getPage,
  viewCategory,
};
