const getPage = async (req, res) => {
  res.render("customer/home/cust-home");
};

module.exports = {
  getPage,
};
