const getPage = async (req, res) => {
  res.render("customer/signup/cust-signup");
};

const enterOTP = async (req, res) => {
  res.render("customer/signup/cust-signup-otp");
};

module.exports = {
  getPage,
  enterOTP,
};
