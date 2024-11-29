const getPage = async (req, res) => {
  try {
    if (req.session.admin) {
      res.render("admin/home/admin-home");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Admin Home");
  }
};

module.exports = {
  getPage,
};
