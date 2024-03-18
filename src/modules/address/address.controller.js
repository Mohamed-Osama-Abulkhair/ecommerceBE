import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { userModel } from "../../../databases/models/user.model.js";

const addAddress = catchAsyncError(async (req, res, next) => {
  const result = await userModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { addresses: req.body } },
    { new: true }
  );

  !result && next(new appError("user not found", 404));
  result &&
    res.status(200).json({ message: "success", result: result.addresses });
});

const removeAddress = catchAsyncError(async (req, res, next) => {
  const result = await userModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { addresses: { _id: req.body.address } } },
    { new: true }
  );

  !result && next(new appError("user not found", 404));
  result &&
    res.status(200).json({ message: "success", result: result.addresses });
});

const getAllAddress = catchAsyncError(async (req, res, next) => {
  const result = await userModel.findOne({ _id: req.user._id });

  !result && next(new appError("user not found", 404));
  result &&
    res.status(200).json({ message: "success", result: result.addresses });
});

export { addAddress, removeAddress, getAllAddress };
