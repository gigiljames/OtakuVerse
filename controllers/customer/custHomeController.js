const Customer = require("../../models/customerModel");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const Address = require("../../models/addressModel");
const bcrypt = require("bcrypt");

const getPage = async (req, res) => {
  try {
    let displayData = [];
    const categoryList = await Category.find(
      { is_deleted: false, is_enabled: true },
      { category_name: 1 }
    );
    for (let i = 0; i < categoryList.length; i++) {
      let temp = {};
      let productList = await Product.find({
        category: categoryList[i]._id,
        is_deleted: false,
        is_enabled: true,
      }).limit(4);
      if (productList.length > 0) {
        temp.categoryInfo = categoryList[i];
        temp.productList = productList;
        displayData.push(temp);
      }
    }
    // console.log(displayData);
    if (req.session.user) {
      const customer = await Customer.findById(req.session.user);
      return res.render("customer/home/cust-home", {
        customerData: customer,
        displayData: displayData,
      });
    }
    return res.render("customer/home/cust-home", {
      displayData,
      isLoggedOut: true,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Customer Home");
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((error) => {
      if (error) {
        console.log(error);
        console.log("ERROR : Customer logout");
      } else {
        return res.redirect("/login");
      }
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Customer Logout");
  }
};

const getProfile = async (req, res) => {
  try {
    let isGoogle = false;
    if (req.session.user) {
      const customer = await Customer.findById(req.session.user).populate(
        "customer_addresses"
      );
      if (!customer.customer_password) {
        isGoogle = true;
      }
      const categoryList = await Category.find(
        { is_deleted: false, is_enabled: true },
        { category_name: 1 }
      );
      return res.render("customer/home/cust-profile", {
        customerData: customer,
        categoryList,
        isGoogle,
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Get profile");
  }
};

const editDetails = async (req, res) => {
  try {
    const { name } = req.body;
    const id = req.session.user;
    await Customer.updateOne({ _id: id }, { $set: { customer_name: name } });
    res.json({ success: true, message: "Name updated successfully." });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Edit Details");
  }
};

const addAddress = async (req, res) => {
  try {
    if (req.session.user) {
      const id = req.session.user;
      const { name, apt, city, street, state, pin, phno } = req.body;
      const address = new Address({
        customer_id: id,
        recipient_name: name,
        apartment: apt,
        street: street,
        city: city,
        state: state,
        pincode: pin,
        phone_number: phno,
      });
      await address.save();
      await Customer.updateOne(
        { _id: id },
        { $push: { customer_addresses: address._id } }
      );
      console.log("New address added successfully");
      // return res.redirect("/profile");
      return res.json({
        success: true,
        message: "Address added successfully.",
        addressID: address._id,
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add Address");
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const custID = req.session.user;
    await Address.deleteOne({ _id: id });
    await Customer.updateOne(
      { _id: custID },
      { $pull: { customer_addresses: id } }
    );
    res.json({ success: true, message: "Address deletion successful." });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Delete Address");
    res.json({
      success: false,
      message:
        "An error occurred while deleting the address. Please try again.",
    });
  }
};

const editAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phno, apt, street, city, state, pin } = req.body;
    await Address.updateOne(
      { _id: id },
      {
        $set: {
          recipient_name: name,
          phone_number: phno,
          apartment: apt,
          street: street,
          city: city,
          state: state,
          pincode: pin,
        },
      }
    );
    return res.json({ success: true, message: "Address edited successfully." });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Edit Address");
  }
};

const changePasswordPage = async (req, res) => {
  try {
    const categoryList = await Category.find(
      { is_deleted: false, is_enabled: true },
      { category_name: 1 }
    );
    res.render("customer/home/cust-change-password", { categoryList });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Change Password");
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error);
    console.log("ERROR : securePassword function");
  }
};

const changePassword = async (req, res) => {
  try {
    const id = req.session.user;
    const { currpassword, newpassword } = req.body;
    const customer = await Customer.findOne(
      { _id: id },
      { customer_password: 1 }
    );

    if (await bcrypt.compare(currpassword, customer.customer_password)) {
      const hashPassword = await securePassword(newpassword);
      await Customer.updateOne(
        { _id: id },
        { $set: { customer_password: hashPassword } }
      );
      res.json({
        success: true,
        message: "Changed password successfully.",
        redirectUrl: "/logout",
      });
    } else {
      console.log("Incorrect password.");
      res.json({ success: false, message: "Incorrect password." });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Change Password");
    res.status(500).json({
      success: false,
      message: "Something went wrong on our side. Please try again.",
    });
  }
};

module.exports = {
  getPage,
  logout,
  getProfile,
  editDetails,
  addAddress,
  editAddress,
  deleteAddress,
  changePasswordPage,
  changePassword,
};
