import express from "express";
import * as wishlistController from "./wishlist.controller.js";
import { allowedTo, isConfirmed, protectRoutes } from "../auth/auth.js";
import { validation } from "../../middleware/validation.js";
import { createWishlistSchema } from "./wishlist.validation.js";

const wishlistRouter = express.Router();

wishlistRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("user"),
    // isConfirmed,
    validation(createWishlistSchema),
    wishlistController.addToWishlist
  )
  .get(protectRoutes, allowedTo("user"), wishlistController.getAllUserWishlist);

wishlistRouter
  .route("/:product")
  .delete(
    protectRoutes,
    allowedTo("user"),
    // isConfirmed,
    validation(createWishlistSchema),
    wishlistController.removeFromWishlist
  );

export default wishlistRouter;
