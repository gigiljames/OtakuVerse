const Customer = require("../../models/customerModel");

const getPage = async (req, res) => {
  try {
    const { offset } = req.query;
    const limit = 10;
    const customerCount = await Customer.find().countDocuments();
    res.render("admin/customerManagement/customer-list", {
      customerCount: Math.ceil(customerCount / limit),
      offset,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Customer List");
  }
};

const getCustomers = async (req, res) => {
  try {
    const { search, sort } = req.query;
    const offset = req.query.offset || 1;
    const limit = 10;
    const customerList = await Customer.find(
      {
        account_status: { $ne: "deleted" },
        $or: [
          { customer_name: { $regex: search, $options: "i" } },
          { customer_email: { $regex: search, $options: "i" } },
        ],
      },
      { customer_name: 1, customer_email: 1, account_status: 1 }
    )
      .skip(limit * (offset - 1))
      .limit(limit);
    res.json({
      success: true,
      customerList,
      offset,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get Customers");
  }
};

const viewCustomer = async (req, res) => {
  res.render("admin/customerManagement/view-customer");
};

function generateReferralCode(length = 16) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let referralCode = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    referralCode += characters[randomIndex];
  }
  return referralCode;
}

const addCustomer = async (req, res) => {
  try {
    const { name, email, password, status } = req.body;
    const temp = await Customer.find({ customer_email: email });
    if (temp.length > 0) {
      return res.json({
        success: false,
        message: "User already exists.",
      });
    }
    const customer = new Customer({
      customer_name: name,
      customer_email: email,
      customer_password: password,
      account_status: status,
      referral_code: generateReferralCode(),
    });
    const saveConfirmation = await customer.save();
    return res.json({
      success: true,
      message: "Customer added successfully.",
      data: saveConfirmation,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add Customer");
    return res.json({
      success: false,
      message: "An error occured while adding customer.",
    });
  }
};

const blockCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await Customer.updateOne(
      { _id: id },
      { $set: { account_status: "banned" } }
    );
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Block Customer");
    return res.json({
      success: false,
      message: "An error occured while blocking customer.",
    });
  }
};

const unblockCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await Customer.updateOne(
      { _id: id },
      { $set: { account_status: "active" } }
    );
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Unblock Customer");
    return res.json({
      success: false,
      message: "An error occured while unblocking customer.",
    });
  }
};

module.exports = {
  getPage,
  getCustomers,
  viewCustomer,
  addCustomer,
  blockCustomer,
  unblockCustomer,
};
