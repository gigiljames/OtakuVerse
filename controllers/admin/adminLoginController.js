const Admin = require("../../models/adminModel");
const bcrypt = require("bcrypt");

const getPage = async (req, res) => {
  try {
    if (req.session.admin) {
      res.redirect("/admin/home");
    } else {
      res.render("admin/login/admin-login");
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Admin Login");
  }
};

const verify = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username });
    if (admin) {
      const passwordMatch = bcrypt.compare(password, admin.password);
      if (passwordMatch) {
        req.session.admin = true;
        return res.redirect("/admin/home");
      }
    } else {
      return res.render("admin/login/admin-login", {
        message: "Incorrect username or password",
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Admin Login");
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((error) => {
      if (error) {
        console.log(error);
        console.log("ERROR : Admin logout");
      } else {
        return res.redirect("/admin");
      }
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Admin Logout");
  }
};

module.exports = {
  getPage,
  verify,
  logout,
};
