import express from "express";
import * as addressController from "./address.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.js";
import { validation } from "../../middleware/validation.js";
import { createAddressSchema, deleteAddressSchema } from "./address.validation.js";

const addressRouter = express.Router();

addressRouter
  .route("/")
  .patch(
    validation(createAddressSchema),
    protectRoutes,
    allowedTo("user"),
    addressController.addAddress 
  )
  .delete(
    validation(deleteAddressSchema),
    protectRoutes,
    allowedTo("user"),
    addressController.removeAddress
  )
  .get(protectRoutes, allowedTo("user"), addressController.getAllAddress);

export default addressRouter;
