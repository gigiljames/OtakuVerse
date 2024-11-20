const getPage = async (req, res) => {
  res.render("admin/customerManagement/customer-list");
};

const viewCustomer = async (req, res) => {
  res.render("admin/customerManagement/view-customer");
};

module.exports = {
  getPage,
  viewCustomer,
};
