const getPage = async (req, res) => {
  res.render("admin/home/admin-home");
};

module.exports = {
  getPage,
};
