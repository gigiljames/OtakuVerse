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

const verify = async (req, res) => {
  const { email, password } = req.body;
  res.send({ email, password });
};

module.exports = {
  getPage,
  forgotPassword,
  resetPassword,
  enterOTP,
  verify,
};
