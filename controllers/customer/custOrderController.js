const Address = require("../../models/addressModel");
const Cart = require("../../models/cartModel");
const Category = require("../../models/categoryModel");
const Customer = require("../../models/customerModel");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const Wishlist = require("../../models/wishlistModel");
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
    if (item.variant_id.stock_quantity !== 0) {
      const product = item.product_id;
      bill.subtotal += product.price * item.quantity;
      bill.grand_total +=
        product.price * item.quantity * (1 - product.discount / 100);
      bill.discount -= product.price * item.quantity * (product.discount / 100);
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
  // bill.subtotal = formatter.format(bill.subtotal);
  // bill.discount = formatter.format(bill.discount);
  // bill.total = formatter.format(bill.total);
  // bill.grand_total = formatter.format(bill.grand_total);
  // bill.you_save = formatter.format(bill.you_save);
  // bill.you_save_percent = formatter.format(bill.you_save_percent);
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
    // console.log(cart.cart_items);
    if (cart) {
      const cartWithQty = await Cart.findOne(
        { customer_id: custID },
        { cart_items: 1 }
      )
        .populate("cart_items.variant_id", "stock_quantity")
        .populate("cart_items.product_id", "product_name");
      let bill = getBill(cart);
      return res.render("customer/order/cust-cart", {
        categoryList,
        items: cart.cart_items,
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
        { "cart_items.variant_id": variantID },
        { cart_items: { $elemMatch: { variant_id: variantID } } }
      );
      if (cartItemExists) {
        // console.log(cartItemExists.cart_items[0].quantity);
        const quantity = cartItemExists.cart_items[0].quantity;
        console.log(cartItemExists.cart_items);
        console.log("qty in cart " + quantity);
        console.log("qty adding " + qty);
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
    const { addressID, paymentMethod } = req.body;
    let { amount } = req.body;
    const addressFromDB = await Address.findById(addressID);
    let address = {
      recipient_name: addressFromDB.recipient_name,
      apartment: addressFromDB.apartment,
      city: addressFromDB.city,
      street: addressFromDB.street,
      state: addressFromDB.state,
      pincode: addressFromDB.pincode,
      phone_number: addressFromDB.phone_number,
    };
    const cart = await Cart.findOne({ customer_id: custID })
      .populate("cart_items.variant_id", "colour size")
      .populate(
        "cart_items.product_id",
        "price discount product_name product_images"
      );
    const cartWithQty = await Cart.findOne(
      { customer_id: custID },
      { cart_items: 1 }
    )
      .populate("cart_items.variant_id", "stock_quantity")
      .populate("cart_items.product_id", "product_name");
    //checking stock availability
    let flag = 0;
    let outOfStockMessage = "";
    cartWithQty.cart_items.forEach((item) => {
      if (item.quantity > item.variant_id.stock_quantity) {
        flag = 1;
        outOfStockMessage += `${item.product_id.product_name} just got out of stock.\n`;
      }
    });
    if (flag === 1) {
      return res.json({ success: false, message: outOfStockMessage });
    } else {
      //updating stock
      cartWithQty.cart_items.forEach(async (item) => {
        await ProductVariant.updateOne(
          { _id: item.variant_id },
          { $inc: { stock_quantity: -item.quantity } }
        );
      });
      const cartItems = cart.cart_items;
      let orderItems = [];
      cartItems.forEach((item) => {
        let temp = {};
        temp.product_id = item.product_id;
        temp.variant_id = item.variant_id;
        temp.product_name = item.product_id.product_name;
        temp.price = item.product_id.price;
        temp.discount = item.product_id.discount;
        temp.product_images = item.product_id.product_images.slice(0, 1);
        temp.colour = item.variant_id.colour;
        temp.size = item.variant_id.size;
        temp.quantity = item.quantity;
        orderItems.push(temp);
      });
      let date = new Date();
      date.setDate(date.getDate() + 7);
      const order = new Order({
        customer_id: custID,
        payment_type: paymentMethod,
        amount: amount,
        address: address,
        order_items: orderItems,
        delivery_date: date,
      });
      console.log(order.order_items);
      //clearing cart
      await Cart.updateOne(
        { customer_id: custID },
        { $set: { cart_items: [] } }
      );
      await order.save();
      return res.json({
        success: true,
        message: "Order placed successfully.",
        redirectUrl: "/orders",
      });
    }

    // console.log(order);
  } catch (error) {
    console.log(error);
    console.log("ERROR : Place Order");
  }
};

const ordersPage = async (req, res) => {
  try {
    const custID = req.session.user;
    const orders = await Order.find({ customer_id: custID }).populate(
      "address"
    );
    const categoryList = await getCategoryList();
    res.render("customer/order/cust-orders", { orders, categoryList });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Orders Page");
  }
};

const cancelItem = async (req, res) => {
  try {
    const { orderID, variantID } = req.params;
    const { qty } = req.body;
    //pull value
    await Order.updateOne(
      { _id: orderID },
      {
        $pull: {
          order_items: { variant_id: variantID },
        },
      }
    );
    //update stock
    await ProductVariant.updateOne(
      { _id: variantID },
      { $inc: { stock_quantity: qty } }
    );
    // url adichu keriyalum error varathe irikkan ulla validation cheyyanam
    // ippol button hide cheythitte ollu
    res.json({
      success: true,
      message: "Item has been cancelled successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Cancel Item");
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderID } = req.params;
    const order = await Order.findById(orderID);
    //re-stock
    order.order_items.forEach(async (item) => {
      await ProductVariant.updateOne(
        { _id: item.variant_id },
        { $inc: { stock_quantity: item.quantity } }
      );
    });
    //cancel order
    await Order.updateOne(
      { _id: orderID },
      { $set: { order_status: "cancelled" } }
    );
    res.json({
      success: true,
      message: "Order has been cancelled successfully.",
    });
  } catch (error) {
    console.log(error);
    console.log("ERROR : Cancel Order");
  }
};

const wishlistPage = async (req, res) => {
  try {
    const custID = req.session.user;
    const categoryList = await getCategoryList();
    const wishlist = await Wishlist.findOne({ customer_id: custID })
      .populate("wishlist_items.product_id")
      .populate("wishlist_items.variant_id");
    if (wishlist) {
      return res.render("customer/order/cust-wishlist", {
        items: wishlist.wishlist_items,
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
  addToCart,
  removeOneFromCart,
  removeFromCart,
  checkout,
  placeOrder,
  ordersPage,
  cancelItem,
  cancelOrder,
  wishlistPage,
  addToWishlist,
  removeFromWishlist,
};
