const Customer = require("./customerModel");
const Product = require("./productModel");
const Category = require("./categoryModel");
const Admin = require("./adminModel");
const ProductVariant = require("./productVariantModel");
const ProductReview = require("./productReviewModel");
const bcrypt = require("bcrypt");

const adminInsertion = async () => {
  try {
    const password = "";
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = new Admin({
      username: "admin@123",
      password: passwordHash,
    });
    const saveConfirmation = await admin.save();
    if (saveConfirmation) {
      console.log("Data inserted into Admin collection.");
    } else {
      console.log("Admin data insertion : Something went wrong.");
    }
  } catch (error) {
    console.log(error);
    console.log("Admin data insertion : Something went wrong.");
  }
};

const customerInsertion = async () => {
  try {
    const customer = new Customer({
      customer_name: "Example Name",
      customer_email: "example@gmail.com",
      customer_password: "123",
      account_status: "active",
    });
    const saveConfirmation = await customer.save();
    if (saveConfirmation) {
      console.log("Data inserted into Customer collection.");
    } else {
      console.log("Customer data insertion : Something went wrong.");
    }
  } catch (error) {
    console.log(error);
    console.log("Customer data insertion : Something went wrong.");
  }
};

const categoryInsertion = async () => {
  try {
    const category = new Category({
      category_name: "Example Category",
      category_desc:
        "Example category description example category description example category description example category description example category description example category description",
    });
    const saveConfirmation = await category.save();
    if (saveConfirmation) {
      console.log("Data inserted into Category collection.");
    } else {
      console.log("Category data insertion : Something went wrong.");
    }
  } catch (error) {
    console.log(error);
    console.log("Category data insertion : Something went wrong.");
  }
};

// adminInsertion();
// customerInsertion();
// categoryInsertion();
