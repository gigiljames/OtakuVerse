const Address = require("../../models/addressModel");
const Cart = require("../../models/cartModel");
const Category = require("../../models/categoryModel");
const Coupon = require("../../models/couponModel");
const CouponUses = require("../../models/couponUsesModel");
const Customer = require("../../models/customerModel");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const Wishlist = require("../../models/wishlistModel");
const ProductVariant = require("../../models/productVariantModel");
const Wallet = require("../../models/walletModel");

async function getCategoryList() {
  const categoryList = await Category.find(
    { is_deleted: false, is_enabled: true },
    { category_name: 1 }
  );
  return categoryList;
}

const getBill = function (cart) {
  let bill = {
    subtotal: 0,
    delivery_charges: 80,
    total: 0,
    discount: 0,
    free_delivery: -80,
    grand_total: 0,
    you_save: 0,
    you_save_percent: 0,
    total_quantity: 0,
  };
  cart.cart_items.forEach((item) => {
    // console.log(item);
    if (item.variant_id.stock_quantity !== 0) {
      const product = item.product_id;
      bill.subtotal += product.price * item.quantity;
      bill.grand_total += product.offer_price * item.quantity;
      bill.discount -=
        product.price * item.quantity * (product.applied_discount / 100);
      bill.total_quantity += item.quantity;
    }
  });
  bill.total = bill.subtotal + bill.delivery_charges;
  bill.grand_total += bill.delivery_charges + bill.free_delivery;
  bill.you_save = bill.total - bill.grand_total;
  bill.you_save_percent = (bill.you_save * 100) / bill.total;
  bill.subtotal = bill.subtotal.toFixed(2);
  bill.discount = bill.discount.toFixed(2);
  bill.total = bill.total.toFixed(2);
  bill.grand_total = bill.grand_total.toFixed(2);
  bill.you_save = bill.you_save.toFixed(2);
  bill.you_save_percent = bill.you_save_percent.toFixed(2);
  return bill;
};

const cartPage = async (req, res) => {
  try {
    const custID = req.session.user;
    const categoryList = await getCategoryList();
    let cart = await Cart.findOne({ customer_id: custID })
      .populate(
        "cart_items.product_id",
        "product_name price discount product_images category"
      )
      .populate("cart_items.variant_id");
    // console.log(cart);
    //Finding deleted products or variants from items included in cart and removing them
    const deletedItems = [];
    if (cart.cart_items.length > 0) {
      cart.cart_items.forEach((item) => {
        if (item.variant_id === null || item.product_id === null) {
          deletedItems.push(item._id);
        }
      });
      await Cart.updateOne(
        { customer_id: custID },
        {
          $pull: {
            cart_items: {
              _id: { $in: deletedItems },
            },
          },
        }
      );
    }

    cart = await Cart.findOne({ customer_id: custID })
      .populate(
        "cart_items.product_id",
        "product_name price discount product_images category"
      )
      .populate("cart_items.variant_id");
    await cart.populate("cart_items.product_id.category", "offer");

    const plainCart = cart.toObject();
    plainCart.cart_items.forEach((product) => {
      product = product.product_id;
      let highestOffer =
        product.discount > product.category.offer
          ? product.discount
          : product.category.offer;
      let offerPrice = (product.price * (1 - highestOffer / 100)).toFixed(2);
      product.offer_price = offerPrice;
      product.applied_discount = highestOffer;
    });

    if (cart) {
      const cartWithQty = await Cart.findOne(
        { customer_id: custID },
        { cart_items: 1 }
      )
        .populate("cart_items.variant_id", "stock_quantity")
        .populate("cart_items.product_id", "product_name");
      let bill = getBill(plainCart);
      return res.render("customer/order/cust-cart", {
        categoryList,
        items: plainCart.cart_items,
        bill,
      });
    } else {
      return res.render("customer/order/cust-cart", {
        categoryList,
        items: [],
        bill: {},
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Cart Page");
  }
};

const refreshBill = async (req, res) => {
  try {
    const custID = req.session.user;
    const cart = await Cart.findOne({ customer_id: custID })
      .populate(
        "cart_items.product_id",
        "product_name price discount product_images category"
      )
      .populate("cart_items.variant_id");
    await cart.populate("cart_items.product_id.category", "offer");
    const plainCart = cart.toObject();
    plainCart.cart_items.forEach((product) => {
      product = product.product_id;
      let highestOffer =
        product.discount > product.category.offer
          ? product.discount
          : product.category.offer;
      let offerPrice = (product.price * (1 - highestOffer / 100)).toFixed(2);
      product.offer_price = offerPrice;
      product.applied_discount = highestOffer;
    });
    const bill = getBill(plainCart);
    return res.json({ success: true, bill });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Refresh Cart Bill");
  }
};

const addToCart = async (req, res) => {
  try {
    const custID = req.session.user;
    const { productID } = req.params;
    const { variantID } = req.body;
    //Checking if item exists
    const productExists = await Product.findById(productID);
    const variantExists = await ProductVariant.findById(variantID);
    if (!productExists || !variantExists) {
      return res.json({
        success: false,
        message: "Product has been disabled or deleted.",
      });
    }

    let { qty } = req.body;
    qty = Number(qty);
    const cart = await Cart.findOne({ customer_id: custID });
    const variant = await ProductVariant.findOne(
      { _id: variantID },
      { stock_quantity: 1 }
    );
    const stockLeft = variant.stock_quantity;
    if (stockLeft === 0) {
      return res.json({
        success: false,
        message: "Product out of stock.",
      });
    }
    if (!cart) {
      const cart = new Cart({
        customer_id: custID,
      });
      await cart.save();
    }
    if (qty <= 5 && qty >= 1) {
      const cartItemExists = await Cart.findOne(
        {
          "cart_items.variant_id": variantID,
          customer_id: custID,
        },
        { cart_items: { $elemMatch: { variant_id: variantID } } }
      );

      // console.log(cartItemExists);
      if (cartItemExists) {
        // console.log(cartItemExists.cart_items[0].quantity);
        const quantity = cartItemExists.cart_items[0].quantity;
        // console.log(cartItemExists.cart_items);
        // console.log("qty in cart " + quantity);
        // console.log("qty adding " + qty);
        // console.log(quantity + qty);
        if (quantity + qty > stockLeft) {
          return res.json({
            success: false,
            message: "Quantity exceeds stock left.",
          });
        }
        if (quantity + qty > 5) {
          return res.json({
            success: false,
            message: "Cart limit reached for this product.",
          });
        } else {
          await Cart.updateOne(
            { customer_id: custID, "cart_items.variant_id": variantID },
            { $inc: { "cart_items.$.quantity": qty } }
          );
          return res.json({
            success: true,
            message: "Product added to cart successfully.",
          });
        }
      } else {
        if (qty > stockLeft) {
          return res.json({
            success: false,
            message: "Quantity exceeds stock left.",
          });
        }
        const cartItem = {
          product_id: productID,
          variant_id: variantID,
          quantity: qty,
        };
        // console.log(cartItem);
        await Cart.updateOne(
          { customer_id: custID },
          { $push: { cart_items: cartItem } }
        );

        return res.json({
          success: true,
          message: "Product added to cart successfully.",
        });
      }
    } else {
      return res.json({ success: false, message: "Quantity out of range." });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add To Cart");
    return res.json({
      success: false,
      message: "An error occurred while adding product to cart.",
    });
  }
};

const removeOneFromCart = async (req, res) => {
  try {
    const custID = req.session.user;
    const { productID } = req.params;
    const { variantID } = req.body;
    const cartItemExists = await Cart.findOne(
      { "cart_items.variant_id": variantID },
      { cart_items: { $elemMatch: { variant_id: variantID } } }
    );
    if (cartItemExists) {
      const quantity = cartItemExists.cart_items[0].quantity;
      if (quantity <= 1) {
        return res.json({
          success: false,
          message: "Cannot reduce quantity anymore.",
        });
      }
    }
    await Cart.updateOne(
      { customer_id: custID, "cart_items.variant_id": variantID },
      { $inc: { "cart_items.$.quantity": -1 } }
    );
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Remove One From Cart");
  }
};

const removeFromCart = async (req, res) => {
  try {
    const custID = req.session.user;
    const { itemID } = req.params;
    await Cart.updateOne(
      { customer_id: custID },
      { $pull: { cart_items: { _id: itemID } } }
    );
    const cart = await Cart.findOne({ customer_id: custID })
      .populate(
        "cart_items.product_id",
        "product_name price discount product_images"
      )
      .populate("cart_items.variant_id");
    let bill = getBill(cart);
    res.json({
      success: true,
      message: "Item removed from cart successfully.",
      bill,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Remove From Cart");
  }
};

const wishlistPage = async (req, res) => {
  try {
    const custID = req.session.user;
    const categoryList = await getCategoryList();
    let wishlist = await Wishlist.findOne({ customer_id: custID })
      .populate("wishlist_items.product_id")
      .populate("wishlist_items.variant_id");
    if (!wishlist) {
      await Wishlist.insertMany([{ customer_id: custID }]);
    }
    //Finding deleted products or variants from items included in cart and removing them
    const deletedItems = [];
    if (wishlist.wishlist_items.length > 0) {
      wishlist.wishlist_items.forEach((item) => {
        if (item.variant_id === null || item.product_id === null) {
          deletedItems.push(item._id);
        }
      });
      await Wishlist.updateOne(
        { customer_id: custID },
        {
          $pull: {
            wishlist_items: {
              _id: { $in: deletedItems },
            },
          },
        }
      );
    }
    wishlist = await Wishlist.findOne({ customer_id: custID })
      .populate("wishlist_items.product_id")
      .populate("wishlist_items.variant_id");

    await wishlist.populate("wishlist_items.product_id.category", "offer");
    const plainWishlist = wishlist.toObject();
    plainWishlist.wishlist_items.forEach((product) => {
      product = product.product_id;
      let highestOffer =
        product.discount > product.category.offer
          ? product.discount
          : product.category.offer;
      let offerPrice = (product.price * (1 - highestOffer / 100)).toFixed(2);
      product.offer_price = offerPrice;
      product.applied_discount = highestOffer;
    });
    if (wishlist) {
      return res.render("customer/order/cust-wishlist", {
        items: plainWishlist.wishlist_items,
        categoryList,
      });
    } else {
      return res.render("customer/order/cust-wishlist", {
        items: [],
        categoryList,
      });
    }
  } catch (error) {
    console.log(error);
    console.log("ERROR : Wishlist page");
  }
};

const addToWishlist = async (req, res) => {
  try {
    const custID = req.session.user;
    const id = req.params.productID;
    const { variantID } = req.body;

    //Checking if item exists
    const productExists = await Product.findById(id);
    const variantExists = await ProductVariant.findById(variantID);
    if (!productExists || !variantExists) {
      return res.json({
        success: false,
        message: "Product has been disabled or deleted.",
      });
    }

    const itemExists = await Wishlist.findOne({
      "wishlist_items.product_id": id,
      "wishlist_items.variant_id": variantID,
    });
    if (itemExists) {
      return res.json({
        success: false,
        message: "Product already added to wishlist.",
      });
    }
    const result = await Wishlist.updateOne(
      { customer_id: custID },
      {
        $push: {
          wishlist_items: { product_id: id, variant_id: variantID },
        },
      },
      { upsert: true }
    );
    return res.json({
      success: true,
      message: "Product added to wishlist successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Add To Wishlist");
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const custID = req.session.user;
    const id = req.params.itemID;
    await Wishlist.updateOne(
      { customer_id: custID },
      { $pull: { wishlist_items: { _id: id } } }
    );
    return res.json({
      success: true,
      message: "Product removed from wishlist successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Remove From Wishlist");
  }
};

module.exports = {
  cartPage,
  refreshBill,
  addToCart,
  removeOneFromCart,
  removeFromCart,
  wishlistPage,
  addToWishlist,
  removeFromWishlist,
};
