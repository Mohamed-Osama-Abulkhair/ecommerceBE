import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import * as factory from "../handlers/factory.handler.js";
import { couponModel } from "../../../databases/models/coupon.model.js";
import qrcode from "qrcode";

// 1- add coupon
const addCoupon = catchAsyncError(async (req, res, next) => {
  let result = new couponModel(req.body);
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all coupons
const getAllCoupons = catchAsyncError(async (req, res, next) => {
  let result = await couponModel.find({});

  res.status(200).json({ message: "success", result });
});

// 3- get one coupon
const getCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await couponModel.findById(id);
  let url = await qrcode.toDataURL(result.code);
  !result && next(new appError("coupon not found", 404));
  result && res.status(200).json({ message: "success", result, url });
});

// 4- update one coupon
const updateCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await couponModel.findByIdAndUpdate(id, req.body, { new: true });

  !result && next(new appError("coupon not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 5- delete one coupon
const deleteCoupon = factory.deleteOne(couponModel);

export { addCoupon, getAllCoupons, getCoupon, updateCoupon, deleteCoupon };
