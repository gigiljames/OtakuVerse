const Customer = require("../../models/customerModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();

const getPage = async (req, res) => {
  try {
    return res.render("customer/signup/cust-signup");
  } catch (error) {
    console.log(error);
    console.log("ERROR : Sign up");
  }
};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email, otp) {
  try {
    console.log("Sending OTP");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Verfiy your OtakuVerse account",
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP: ${otp}</b>`,
    });
    console.log("OTP sent successfully");
    return info.accepted.length > 0;
  } catch (error) {
    console.log(error);
    console.log("ERROR : sendVerificationEmail function");
  }
}

const verify = async (req, res) => {
  try {
    // res.render("customer/signup/cust-signup");
    console.log("/signup POST");
    const { name, email, password } = req.body;
    const customerExists = await Customer.findOne({ customer_email: email });
    if (customerExists) {
      return res.render("customer/signup/cust-signup", {
        message: "User already exists",
      });
    }
    const otp = generateOtp();
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.json("email-error");
    }
    req.session.customerOtp = otp;
    req.session.customerData = { name, email, password };
    console.log("OTP : ", otp);
    return res.render("customer/signup/cust-signup-otp");
  } catch (error) {
    console.log(error);
    console.log("ERROR : Sign up");
  }
};

const enterOTP = async (req, res) => {
  return res.render("customer/signup/cust-signup-otp");
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

const verifyOtp = async (req, res) => {
  try {
    console.log("/verify-login POST");
    const { otp } = req.body;
    console.log("Saved otp: ", req.session.customerOtp);
    if (otp === req.session.customerOtp) {
      const user = req.session.customerData;
      const passwordHash = await securePassword(user.password);
      const customer = new Customer({
        customer_name: user.name,
        customer_email: user.email,
        customer_password: passwordHash,
      });
      const saveConfirmation = await customer.save();
      console.log("Customer signed in successfully.");
      req.session.user = customer._id;
      res.json({ success: true, redirectUrl: "/login" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Inavlid OTP, Please try again" });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Verify OTP");
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.session.customerData;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email not found in session" });
    }
    const otp = generateOtp();
    req.session.customerOtp = otp;
    const emailSent = await sendVerificationEmail(email, otp);
    if (emailSent) {
      console.log("Resend OTP: ", otp);
      res
        .status(200)
        .json({ success: true, message: "OTP resend successfully" });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to resend OTP. Please try again",
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Resend OTP");
  }
};

const verifyGoogleUser = async (req, res) => {
  const customer = await Customer.findOne(
    { google_id: req.user.google_id },
    { account_status: 1 }
  );
  if (customer && customer.account_status === "banned") {
    return res.redirect("/login?status=banned");
  } else {
    req.session.user = req.user._id;
    return res.redirect("/");
  }
};

module.exports = {
  getPage,
  enterOTP,
  verify,
  verifyOtp,
  resendOtp,
  verifyGoogleUser,
};
