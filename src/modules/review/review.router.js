import express from "express";
import * as reviewController from "./review.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.js";
import { validation } from "../../middleware/validation.js";
import { createReviewSchema, getReviewSchema, updateReviewSchema } from "./review.validation.js";

const reviewRouter = express.Router();

reviewRouter
  .route("/")
  .post(validation(createReviewSchema),protectRoutes,allowedTo("user"),reviewController.addReview)
  .get(reviewController.getAllReviews);

reviewRouter
  .route("/:id")
  .get(validation(getReviewSchema),reviewController.getReview)
  .put(validation(updateReviewSchema),protectRoutes,allowedTo("user"),reviewController.updateReview)
  .delete(validation(getReviewSchema),protectRoutes,allowedTo("admin","user"),reviewController.deleteReview);

export default reviewRouter;
