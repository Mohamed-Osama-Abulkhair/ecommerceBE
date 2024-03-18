import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import * as factory from "../handlers/factory.handler.js";
import { couponModel } from "../../../databases/models/coupon.model.js";
import qrcode from "qrcode";
import { ApiFeatures, shuffleArray } from "../../utils/ApiFeatures.js";
import { userModel } from "../../../databases/models/user.model.js";

// 1- add coupon
const addCoupon = catchAsyncError(async (req, res, next) => {
  let { code } = req.body;

  const coupon = await couponModel.findOne({ code: code.toLowerCase() });
  if (coupon) return next(new appError("coupon is already exists", 409));

  const result = new couponModel({
    code: req.body.code.toLowerCase(),
    expires: req.body.expires,
    discount: req.body.discount,
  });
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all coupons
const getAllCoupons = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(couponModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalCoupons = await couponModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not coupons added yet", 404));

  apiFeatures.calculateTotalAndPages(totalCoupons);
  result.length &&
    res.status(200).json({
      message: "success",
      totalCoupons,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get one coupon
const getCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const result = await couponModel.findById(id);
  if (!result) return next(new appError("coupon not found", 404));

  const url = await qrcode.toDataURL(result.code);
  result && res.status(200).json({ message: "success", result, url });
});

// 4- get one coupon gift
const getCouponUserGift = catchAsyncError(async (req, res, next) => {
  let user = await userModel.findById(req.user._id);

  if (
    !user.getCoupon ||
    Date.now() - user.getCoupon.getTime() >= 24 * 60 * 60 * 1000
  ) {
    let result = await couponModel.find();
    if (!result.length) return next(new appError("No coupons added yet", 404));

    result = shuffleArray(result)[0];
    const url = await qrcode.toDataURL(result.code);

    user.getCoupon = new Date();
    await user.save();

    return res.status(200).json({ message: "Success", result, url });
  }

  const timeDifference = Date.now() - user.getCoupon.getTime();
  const hoursPassed = Math.floor(timeDifference / (1000 * 60 * 60));
  next(
    new appError(
      `You have already received a coupon within the last 24 hours, remain: ${
        24 - hoursPassed
      } hours`,
      401
    )
  );
});

// 5- update one coupon
const updateCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await couponModel.findById(id);
  if (!coupon) return next(new appError("coupon not found", 404));

  if (req.body.code) {
    const isExist = await couponModel.findOne({
      code: req.body.code.toLowerCase(),
    });
    if (isExist) return next(new appError("coupon is already exists", 409));
    coupon.code = req.body.code.toLowerCase();
  }
  if (req.body.discount) coupon.discount = req.body.discount;
  if (req.body.expires) coupon.expires = req.body.expires;

  await coupon.save();

  res.status(200).json({ message: "success", result: coupon });
});

// 6- delete one coupon
const deleteCoupon = factory.deleteOne(couponModel);

export {
  addCoupon,
  getAllCoupons,
  getCoupon,
  getCouponUserGift,
  updateCoupon,
  deleteCoupon,
};
