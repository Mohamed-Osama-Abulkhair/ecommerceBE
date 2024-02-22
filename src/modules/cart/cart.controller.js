import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { cartModel } from "../../../databases/models/cart.model.js";
import { productModel } from "../../../databases/models/product.model.js";
import { couponModel } from "../../../databases/models/coupon.model.js";

// 1- add Product To Cart

function calcTotalPrice(userCart) {
  let totalPrice = 0;
  userCart.cartItems.forEach((elm) => {
    totalPrice += elm.quantity * elm.price;
  });
  userCart.totalPrice = totalPrice;
}

const addProductToCart = catchAsyncError(async (req, res, next) => {
  let product = await productModel
    .findById(req.body.product)
    .select("price quantity");
  if (!product) return next(new appError("product not found", 401));
  let quantityNeed = req.body.quantity ? req.body.quantity : 1;
  if (product.quantity >= quantityNeed) {
    req.body.price = product.price;

    let cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      let result = new cartModel({ user: req.user._id, cartItems: [req.body] });
      calcTotalPrice(result);

      await result.save();
      return res.status(201).json({ message: "success", result });
    }

    let item = cart.cartItems.find((elm) => elm.product == req.body.product);
    if (item && product.quantity >= quantityNeed + item.quantity) {
      item.quantity += req.body.quantity || 1;
    } else if (!item && product.quantity >= quantityNeed) {
      cart.cartItems.push(req.body);
    } else {
      return next(
        new appError(`only ${product.quantity} products are available`, 401)
      );
    }
    calcTotalPrice(cart);

    if (cart.discount) {
      cart.totalPriceAfterDiscount =
        cart.totalPrice - (cart.totalPrice * cart.discount) / 100;
    }

    await cart.save();
    return res.status(200).json({ message: "success", cart });
  }
  return next(
    new appError(`only ${product.quantity} products are available`, 401)
  );
});

// 2- delete Product from Cart
const deleteProductFromCart = catchAsyncError(async (req, res, next) => {
  let cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) return next(new appError("cart not found", 401));

  let item = cart.cartItems.find((item) => item._id == req.params.id);

  let result = await cartModel.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: req.params.id } } },
    { new: true }
  );

  calcTotalPrice(result);

  if (result.discount) {
    result.totalPriceAfterDiscount =
      result.totalPrice - (result.totalPrice * result.discount) / 100;
  }

  !item && next(new appError("item not found", 401));
  item && res.status(200).json({ message: "success", result });
});

// 3- update product quantity
const updateQuantity = catchAsyncError(async (req, res, next) => {
  let product = await productModel.findById(req.params.id).select("price");
  if (!product) return next(new appError("product not found", 401));

  let cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) return next(new appError("cart not found", 401));

  let item = cart.cartItems.find((elm) => elm.product == req.params.id);
  if (item) item.quantity = req.body.quantity;

  calcTotalPrice(cart);

  if (cart.discount) {
    cart.totalPriceAfterDiscount =
      cart.totalPrice - (cart.totalPrice * cart.discount) / 100;
  }

  await cart.save();
  res.status(200).json({ message: "success", cart });
});

// 4- apply Coupon

const applyCoupon = catchAsyncError(async (req, res, next) => {
  let coupon = await couponModel.findOne({
    code: req.body.code,
    expires: { $gt: Date.now() },
  });

  let cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) return next(new appError("cart not found", 401));

  cart.totalPriceAfterDiscount =
    cart.totalPrice - (cart.totalPrice * coupon.discount) / 100;
  cart.discount = coupon.discount;

  await cart.save();
  res.status(200).json({ message: "success", cart });
});

// 5- get Logged User Cart

const getLoggedUserCart = catchAsyncError(async (req, res, next) => {
  let cart = await cartModel
    .findOne({ user: req.user._id })
    .populate("cartItems.product");

  !cart && next(new appError("cart not found", 401));
  cart && res.status(200).json({ message: "success", cart });
});

// 6- clear Cart
const clearCart = catchAsyncError(async (req, res, next) => {
  let cart = await cartModel.findOneAndDelete({ user: req.user._id });
  res.status(200).json({ message: "success", cart });
});

export {
  addProductToCart,
  deleteProductFromCart,
  updateQuantity,
  applyCoupon,
  getLoggedUserCart,
  clearCart,
};
