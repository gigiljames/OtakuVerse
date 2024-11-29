const mongoose = require("mongoose");
const fs = require("fs");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const ProductVariant = require("../../models/productVariantModel");

const getPage = async (req, res) => {
  try {
    const { offset } = req.query;
    const limit = 10;
    const productCount = await Product.find({
      is_deleted: false,
    }).countDocuments();
    const productList = await Product.find({ is_deleted: false })
      .skip(limit * (offset - 1))
      .limit(limit)
      .populate("category", "category_name");
    const categoryList = await Category.find(
      { is_deleted: false },
      { category_name: 1 }
    );
    res.render("admin/productManagement/product-list", {
      productList,
      categoryList,
      pageCount: Math.ceil(productCount / limit),
      offset,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Product List");
  }
};

const viewProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productDetails = await Product.findOne({ _id: id }).populate(
      "category"
    );
    const variants = await Product.findOne(
      { _id: id },
      { variants: 1 }
    ).populate("variants");
    console.log(variants);
    const categoryList = await Category.find(
      { is_deleted: false },
      { category_name: 1 }
    );
    res.render("admin/productManagement/view-product", {
      productDetails,
      categoryList,
      variants,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : View Product");
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, category, price, discount, visibility, desc, specs } =
      req.body;
    const product = new Product({
      product_name: name,
      category: category,
      price: Number(price),
      discount: Number(discount),
      is_enabled: visibility,
      product_desc: desc,
      product_specs: specs,
    });
    const saveConfirmation = await product.save();
    console.log("Product added successfully");
    res.redirect("/admin/product-management?offset=1");
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add Product");
  }
};

const enableProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { offset } = req.query;
    const updateConfirmation = await Product.updateOne(
      { _id: id },
      { $set: { is_enabled: true } }
    );
    console.log("Product enabled successfully");
    return res.redirect(`/admin/product-management?offset=${offset}`);
  } catch (error) {
    console.log(error);
    console.log("ERROR : Enable Product");
  }
};

const disableProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { offset } = req.query;
    const updateConfirmation = await Product.updateOne(
      { _id: id },
      { $set: { is_enabled: false } }
    );
    console.log("Product disabled successfully");
    return res.redirect(`/admin/product-management?offset=${offset}`);
  } catch (error) {
    console.log(error);
    console.log("ERROR : Disable Product");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteConfirmation = await Product.updateOne(
      { _id: id },
      { $set: { is_deleted: true } }
    );
    console.log("Product deleted successfully");
    return res.redirect("/admin/product-management?offset=1");
  } catch (error) {
    console.log(error);
    console.log("ERROR : Delete Product");
  }
};

const editProduct = async (req, res) => {
  try {
    const imageDocs = req.files.map((file) => ({
      filename: file.filename,
      filepath: file.path.slice(6), // removes "public" from path
    }));
    const { id } = req.params;
    const { name, price, desc, category, discount, visibility, specs } =
      req.body;
    const editConfirmation = await Product.updateOne(
      { _id: id },
      {
        $set: {
          product_name: name,
          product_desc: desc,
          product_specs: specs,
          category: category,
          price: price,
          discount: discount,
          is_enabled: visibility,
        },
        $push: { product_images: { $each: imageDocs } },
      }
    );
    console.log("Product edited successfully");
    res.redirect(`/admin/view-product/${id}`);
  } catch (error) {
    console.log(error);
    console.log("ERROR : Edit Product");
  }
};

const deleteImage = async (req, res) => {
  try {
    const { productId, imgId } = req.params;
    const imagePath = await Product.findOne(
      { "product_images._id": imgId },
      { "product_images.filepath": 1 }
    );
    const deleteConfirmation = await Product.updateOne(
      { _id: productId },
      { $pull: { product_images: { _id: imgId } } }
    );
    const filePath = imagePath.product_images[0].filepath;
    fs.unlink("public" + filePath, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Image deleted from directory successfully.");
      }
    });
    console.log("Banner image deleted successfully");
    res.redirect(`/admin/view-product/${productId}`);
  } catch (error) {
    console.log(error);
    console.log("ERROR : Delete Image");
  }
};

const addVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, colour, stock } = req.body;
    // Creating and saving new variant object
    const variant = new ProductVariant({
      product_id: id,
      size,
      colour,
      stock_quantity: stock,
    });
    const saveConfirmation = await variant.save();
    // Updating variant in product collection
    const updateConfirmation = await Product.updateOne(
      { _id: id },
      { $push: { variants: variant._id } }
    );
    console.log(variant._id);
    console.log("Variant added successfully");
    res.redirect(`/admin/view-product/${id}`);
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add Variant");
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const deleteFromProduct = await Product.updateOne(
      { _id: productId },
      { $pull: { variants: variantId } }
    );
    const deleteFromProductVariant = await ProductVariant.deleteOne({
      _id: variantId,
    });
    return res.redirect(`/admin/view-product/${productId}`);
  } catch (error) {
    console.log(error);
    console.log("ERROR : Delete Variant");
  }
};

module.exports = {
  getPage,
  viewProduct,
  addProduct,
  enableProduct,
  disableProduct,
  deleteProduct,
  editProduct,
  deleteImage,
  addVariant,
  deleteVariant,
};
