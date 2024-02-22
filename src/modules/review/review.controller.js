import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import * as factory from "../handlers/factory.handler.js";
import { reviewModel } from "../../../databases/models/review.model.js";

// 1- add Review
const addReview = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user._id;

  let review = await reviewModel.findOne({
    user: req.user._id,
    product: req.body.product,
  });
  if (review) return next(new appError("U created a review before", 409));

  let result = new reviewModel(req.body);
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all Reviews
const getAllReviews = catchAsyncError(async (req, res, next) => {
  let result = await reviewModel.find({});

  res.status(200).json({ message: "success", result });
});

// 3- get one Review
const getReview = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await reviewModel.findById(id);

  !result && next(new appError("Review not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 4- update one Review
const updateReview = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await reviewModel.findOneAndUpdate(
    { _id: id, user: req.user.id },
    req.body,
    { new: true }
  );

  !result && next(new appError("Review not found or U aren't authorized to do this action", 404));
  result && res.status(200).json({ message: "success", result });
});

// 5- delete one Review
const deleteReview = factory.deleteOne(reviewModel);

export { addReview, getAllReviews, getReview, updateReview, deleteReview };
