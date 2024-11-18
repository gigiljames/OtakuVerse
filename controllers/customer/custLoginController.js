const getPage = async (req, res) => {
  res.render("customer/login/cust-login");
};

const forgotPassword = async (req, res) => {
  res.render("customer/login/cust-forgotpassword");
};

const resetPassword = async (req, res) => {
  res.render("customer/login/cust-resetpassword");
};

const enterOTP = async (req, res) => {
  res.render("customer/login/cust-forgotpassword-otp");
};

module.exports = {
  getPage,
  forgotPassword,
  resetPassword,
  enterOTP,
};
