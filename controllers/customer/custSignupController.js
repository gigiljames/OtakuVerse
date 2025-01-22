const Customer = require("../../models/customerModel");
const Wallet = require("../../models/walletModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Cart = require("../../models/cartModel");
const Wishlist = require("../../models/wishlistModel");
require("dotenv").config();

const getPage = async (req, res) => {
  try {
    const { code } = req.query || "";
    req.session.code = code;
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
    // console.log("Sending OTP");
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
    // console.log("OTP sent successfully");
    return info.accepted.length > 0;
  } catch (error) {
    console.log(error);
    console.log("ERROR : sendVerificationEmail function");
  }
}

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

const verify = async (req, res) => {
  try {
    // res.render("customer/signup/cust-signup");
    // console.log("/signup POST");
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
    // console.log(req.session.customerData);
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
    // console.log("/verify-login POST");
    const { otp } = req.body;
    console.log("Saved otp: ", req.session.customerOtp);
    if (otp === req.session.customerOtp) {
      const user = req.session.customerData;
      const passwordHash = await securePassword(user.password);
      const customer = new Customer({
        customer_name: user.name,
        customer_email: user.email,
        customer_password: passwordHash,
        referral_code: generateReferralCode(),
      });
      const saveConfirmation = await customer.save();
      //creating wallet,cart,wishlist
      await Wallet.insertMany([{ customer_id: customer._id }]);
      await Cart.insertMany([{ customer_id: customer._id }]);
      await Wishlist.insertMany([{ customer_id: customer._id }]);
      //Reward
      if (req.session.code) {
        const referrer = await Customer.findOne({
          referral_code: req.session.code,
        });
        if (referrer) {
          const transaction1 = {
            amount: 100,
            transactionType: "credit",
            message: "Referral reward",
          };
          const transaction2 = {
            amount: 25,
            transactionType: "credit",
            message: "Reward for using referral link",
          };
          await Wallet.updateOne(
            { customer_id: referrer._id },
            {
              $inc: { balance: 100 },
              $push: { transaction_history: transaction1 },
            },
            { upsert: true }
          );
          await Wallet.updateOne(
            { customer_id: customer._id },
            {
              $inc: { balance: 25 },
              $push: { transaction_history: transaction2 },
            },
            { upsert: true }
          );
        }
        delete req.session.code;
      }

      console.log("Customer signed in successfully.");
      req.session.user = customer._id;
      return res.json({ success: true, redirectUrl: "/login" });
    } else {
      return res
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
    const email = req.session?.customerData?.email;
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
      return res
        .status(200)
        .json({ success: true, message: "OTP resend successfully" });
    } else {
      return res.status(500).json({
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
