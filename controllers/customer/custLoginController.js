const Customer = require("../../models/customerModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const getPage = async (req, res) => {
  try {
    if (req.session.user) {
      return res.redirect("/");
    } else {
      const { status } = req.query;
      if (status === "banned") {
        return res.render("customer/login/cust-login", {
          message: "User banned by admin.",
        });
      }
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

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const customer = await Customer.findOne(
      { customer_email: email },
      { _id: 1, customer_password: 1 }
    );

    if (!customer) {
      res.json({
        success: false,
        message:
          "The email you have entered is not associated with an account.",
      });
    } else if (!customer.customer_password) {
      res.json({
        success: false,
        message:
          "It looks like you signed up using Google. Please use the 'Sign in with Google' option to log in.",
      });
    } else {
      const otp = generateOtp();
      const emailSent = await sendVerificationEmail(email, otp);
      if (!emailSent) {
        return res.json({
          success: false,
          message: "Oops! An error occured while sending OTP.",
        });
      }
      req.session.forgotPasswordOTP = otp;
      req.session.forgotPasswordEmail = email;
      console.log("OTP : ", otp);
      return res.json({
        success: true,
        message: "OTP sent successfully",
        redirectUrl: "/forgotpassword/enter-otp",
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Send OTP");
  }
};

const enterOTP = async (req, res) => {
  try {
    if (req.session.forgotPasswordEmail) {
      res.render("customer/login/cust-forgotpassword-otp");
    } else {
      res.redirect("/forgotpassword");
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Enter OTP");
  }
};

let enterOtpCount = 0;

const verifyOTP = async (req, res) => {
  try {
    enterOtpCount++;
    console.log("/forgotpassword/enter-otp POST");
    const { otp } = req.body;
    console.log("Entered otp: ", otp);
    console.log("Saved otp: ", req.session.forgotPasswordOTP);
    if (otp === req.session.forgotPasswordOTP) {
      return res.json({ success: true, redirectUrl: "/resetpassword" });
    } else {
      if (enterOtpCount === 3) {
        delete req.session.forgotPasswordEmail;
        delete req.session.forgotPasswordOTP;
        return res.json({
          success: false,
          message: "You have entered the wrong OTP 3 times.",
          redirectUrl: "/login",
        });
      }
      return res.json({
        success: false,
        message: "Invalid OTP, Please try again",
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Verify OTP");
  }
};

const resendOTP = async (req, res) => {
  try {
    const email = req.session.forgotPasswordEmail;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email not found in session" });
    }
    const otp = generateOtp();
    req.session.forgotPasswordOTP = otp;
    const emailSent = await sendVerificationEmail(email, otp);
    if (emailSent) {
      console.log("Resend OTP: ", otp);
      res.status(200).json({
        success: true,
        message: "OTP resend successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to resend OTP. Please try again",
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Forgot Password Resend OTP");
  }
};

const resetPasswordPage = async (req, res) => {
  try {
    if (!req.session.forgotPasswordEmail) {
      res.redirect("/forgotpassword");
    }
    return res.render("customer/login/cust-resetpassword");
  } catch (error) {
    console.log(error);
    console.log("ERROR : Reset Password Page");
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

const resetPassword = async (req, res) => {
  try {
    if (!req.session.forgotPasswordEmail) {
      res.json({ redirectUrl: "/forgotpassword" });
    } else {
      const { password } = req.body;
      const hashPassword = await securePassword(password);
      await Customer.updateOne(
        { customer_email: req.session.forgotPasswordEmail },
        { $set: { customer_password: hashPassword } }
      );
      res.json({
        success: true,
        message: "Password reset successfully.",
        redirectUrl: "/login",
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Reset Password");
  }
};

const verify = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customerExists = await Customer.findOne({
      customer_email: email,
      account_status: { $ne: "deleted" },
    });
    if (!customerExists) {
      return res.json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    if (customerExists.account_status === "banned") {
      return res.json({
        success: false,
        message: "User is banned by admin",
      });
    }
    if (!customerExists.customer_password) {
      return res.json({
        success: false,
        message:
          "It looks like you signed up using Google. Please use the 'Sign in with Google' option to log in.",
      });
    }
    const passwordMatch = await bcrypt.compare(
      password,
      customerExists.customer_password
    );
    if (!passwordMatch) {
      return res.json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    req.session.user = customerExists._id;
    return res.json({ success: true, message: "Logged in successfully." });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Customer Login Verify");
  }
};

module.exports = {
  getPage,
  forgotPassword,
  sendOTP,
  enterOTP,
  verifyOTP,
  resendOTP,
  resetPasswordPage,
  resetPassword,
  verify,
};
