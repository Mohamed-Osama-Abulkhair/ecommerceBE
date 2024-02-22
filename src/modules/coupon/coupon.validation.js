import Joi from "joi";

const createCouponSchema = Joi.object({
  code: Joi.string().min(3).max(20).required(),
  discount: Joi.number().min(0).max(100).required(),
  expires: Joi.date().required(),
});

const getCouponSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateCouponSchema = Joi.object({
  code: Joi.string().min(3).max(20),
  discount: Joi.number().min(0).max(100),
  expires: Joi.date(),
  id: Joi.string().hex().length(24).required(),
}); 

export { createCouponSchema, getCouponSchema, updateCouponSchema };