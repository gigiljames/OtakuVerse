const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (filepath) => {
  try {
    const result = await cloudinary.uploader.upload(filepath);
    return result;
  } catch (error) {
    console.log(error);
    console.log("ERROR: Upload File Cloudinary");
  }
};

module.exports = { uploadFile };
