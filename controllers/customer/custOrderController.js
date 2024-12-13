const Address = require("../../models/addressModel");
const Cart = require("../../models/cartModel");
const Category = require("../../models/categoryModel");
const Customer = require("../../models/customerModel");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const ProductVariant = require("../../models/productVariantModel");

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
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  cart.cart_items.forEach((item) => {
    const product = item.product_id;
    bill.subtotal += product.price * item.quantity;
    bill.grand_total +=
      product.price * item.quantity * (1 - product.discount / 100);
    bill.discount -= product.price * item.quantity * (product.discount / 100);
    bill.total_quantity += item.quantity;
  });
  bill.total = bill.subtotal + bill.delivery_charges;
  bill.grand_total += bill.delivery_charges + bill.free_delivery;
  bill.you_save = bill.total - bill.grand_total;
  bill.you_save_percent = (bill.you_save * 100) / bill.total;
  bill.subtotal = formatter.format(bill.subtotal);
  bill.discount = formatter.format(bill.discount);
  bill.total = formatter.format(bill.total);
  bill.grand_total = formatter.format(bill.grand_total);
  bill.you_save = formatter.format(bill.you_save);
  bill.you_save_percent = formatter.format(bill.you_save_percent);
  return bill;
};

const cartPage = async (req, res) => {
  try {
    const custID = req.session.user;
    const categoryList = await getCategoryList();
    const cart = await Cart.findOne({ customer_id: custID })
      .populate(
        "cart_items.product_id",
        "product_name price discount product_images"
      )
      .populate("cart_items.variant_id");
    let bill = getBill(cart);
    res.render("customer/order/cust-cart", {
      categoryList,
      items: cart.cart_items,
      bill,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Cart Page");
  }
};

const addToCart = async (req, res) => {
  try {
    const custID = req.session.user;
    const { productID } = req.params;
    const { variantID } = req.body;
    let { qty } = req.body;
    qty = Number(qty);
    const cart = await Cart.findOne({ customer_id: custID });
    const variant = await ProductVariant.findOne(
      { _id: variantID },
      { stock_quantity: 1 }
    );
    const stockLeft = variant.stock_quantity;
    if (!cart) {
      const cart = new Cart({
        customer_id: custID,
      });
      await cart.save();
    }
    if (qty <= 5 && qty >= 1) {
      const cartItemExists = await Cart.findOne(
        { "cart_items.variant_id": variantID },
        { cart_items: { $elemMatch: { variant_id: variantID } } }
      );
      if (cartItemExists) {
        // console.log(cartItemExists.cart_items[0].quantity);
        const quantity = cartItemExists.cart_items[0].quantity;
        console.log(quantity);
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

const checkout = async (req, res) => {
  try {
    const categoryList = await getCategoryList();
    const custID = req.session.user;
    const addresses = await Address.find({ customer_id: custID });
    const cart = await Cart.findOne({ customer_id: custID })
      .populate(
        "cart_items.product_id",
        "product_name price discount product_images"
      )
      .populate("cart_items.variant_id");
    const bill = getBill(cart);
    res.render("customer/order/cust-checkout", {
      categoryList,
      bill,
      addresses,
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Checkout");
  }
};

const placeOrder = async (req, res) => {
  try {
    const custID = req.session.user;
    const { addressID, paymentMethod, amount } = req.body;
    const cart = await Cart.findOne({ customer_id: custID });
    const cartItems = cart.cart_items;
    let date = new Date();
    date.setDate(date.getDate() + 7);
    const order = new Order({
      customer_id: custID,
      payment_type: paymentMethod,
      amount: amount,
      address: addressID,
      order_items: cartItems,
      delivery_date: date,
    });
    //check stock availability
    //clear cart
    //reduce stock
    //send alerts
    console.log(order);
  } catch (error) {
    console.log(error);
    console.log("ERROR : Place Order");
  }
};

module.exports = {
  cartPage,
  addToCart,
  removeFromCart,
  checkout,
  placeOrder,
};
