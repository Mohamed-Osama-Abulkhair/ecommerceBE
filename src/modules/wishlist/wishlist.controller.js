import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { userModel } from "../../../databases/models/user.model.js";

const addToWishlist = catchAsyncError(async (req, res, next) => {
  const { product } = req.body;

  const result = await userModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: product } },
    { new: true }
  );

  !result && next(new appError("user not found", 404));
  result &&
    res.status(200).json({ message: "success", result: result.wishlist });
});

const removeFromWishlist = catchAsyncError(async (req, res, next) => {
  const { product } = req.body;

  const result = await userModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: product } },
    { new: true }
  );

  !result && next(new appError("user not found", 404));
  result &&
    res.status(200).json({ message: "success", result: result.wishlist });
});

const getAllUserWishlist = catchAsyncError(async (req, res, next) => {
  const result = await userModel
    .findOne({ _id: req.user._id })
    .populate("wishlist");

  !result && next(new appError("user not found", 404));
  result &&
    res.status(200).json({ message: "success", result: result.wishlist });
});

export { addToWishlist, removeFromWishlist, getAllUserWishlist };
