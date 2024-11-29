const Customer = require("../../models/customerModel");
const bcrypt = require("bcrypt");

const getPage = async (req, res) => {
  try {
    if (req.session.user) {
      return res.redirect("/");
    } else {
      return res.render("customer/login/cust-login");
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Customer Login");
  }
};

const forgotPassword = async (req, res) => {
  return res.render("customer/login/cust-forgotpassword");
};

const resetPassword = async (req, res) => {
  return res.render("customer/login/cust-resetpassword");
};

const verify = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customerExists = await Customer.findOne({
      customer_email: email,
      account_status: { $ne: "deleted" },
    });
    if (customerExists.account_status === "banned") {
      return res.render("customer/login/cust-login", {
        message: "User is banned by admin",
      });
    }
    const passwordMatch = await bcrypt.compare(
      password,
      customerExists.customer_password
    );
    if (!customerExists || !passwordMatch) {
      return res.render("customer/login/cust-login", {
        message: "Incorrect email or password",
      });
    }
    req.session.user = customerExists._id;
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    console.log("ERROR : Customer Login Verify");
  }
};

module.exports = {
  getPage,
  forgotPassword,
  resetPassword,
  verify,
};
