import Joi from "joi";
import { customDateValidator } from "../../middleware/validation.js";

const createCouponSchema = Joi.object({
  code: Joi.string().length(6).lowercase().required(),
  discount: Joi.number().integer().min(0).max(100).required(),
  expires: Joi.custom(customDateValidator, "date format d/m/y").required(),
});

const getCouponSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateCouponSchema = Joi.object({
  code: Joi.string().length(6).lowercase(),
  discount: Joi.number().integer().min(0).max(100),
  expires: Joi.custom(customDateValidator, "date format d/m/y"),
  id: Joi.string().hex().length(24).required(),
});

export { createCouponSchema, getCouponSchema, updateCouponSchema };
