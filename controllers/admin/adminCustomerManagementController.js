const Customer = require("../../models/customerModel");

const getPage = async (req, res) => {
  try {
    const customerList = await Customer.find(
      {},
      { customer_name: 1, customer_email: 1, account_status: 1 }
    );
    res.render("admin/customerManagement/customer-list", { customerList });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Customer List");
  }
};

const viewCustomer = async (req, res) => {
  res.render("admin/customerManagement/view-customer");
};

const addCustomer = async (req, res) => {
  try {
    const { name, email, password, status } = req.body;
    const temp = await Customer.find({ customer_email: email });
    if (temp.length > 0) {
      console.log("User already exists.");
      return res.redirect("/admin/customer-management");
    }
    const customer = new Customer({
      customer_name: name,
      customer_email: email,
      customer_password: password,
      account_status: status,
    });
    const saveConfirmation = await customer.save();
    if (saveConfirmation) {
      console.log("Customer added successfully.");
      return res.redirect("/admin/customer-management");
    } else {
      console.log("Add Customer : Something went wrong");
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add Customer");
  }
};

module.exports = {
  getPage,
  viewCustomer,
  addCustomer,
};
