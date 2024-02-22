import express from "express";
import * as wishlistController from "./wishlist.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.js";
import { validation } from "../../middleware/validation.js";
import { createWishlistSchema } from "./wishlist.validation.js";

const wishlistRouter = express.Router();

wishlistRouter
  .route("/")
  .patch(
    validation(createWishlistSchema),
    protectRoutes,
    allowedTo("user"),
    wishlistController.addToWishlist
  )
  .delete(
    validation(createWishlistSchema),
    protectRoutes,
    allowedTo("user"),
    wishlistController.removeFromWishlist
  )
  .get(protectRoutes, allowedTo("user"), wishlistController.getAllUserWishlist);

export default wishlistRouter;
