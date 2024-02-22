import Joi from "joi";

const createProductSchema = Joi.object({
  title: Joi.string().min(3).max(20).required(),
  description: Joi.string().min(3).max(20).required(),
  quantity: Joi.number().min(1).required(),
  sold: Joi.number().min(0).required(),
  price: Joi.number().min(1).required(),
  category: Joi.string().hex().length(24).required(),
  subcategory: Joi.string().hex().length(24).required(),
  brand: Joi.string().hex().length(24).required(),
  ratingAvg: Joi.number().min(1).required(),
  ratingCount: Joi.number().min(1).required(),
});

const getProductSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateProductSchema = Joi.object({
  title: Joi.string().min(3).max(20),
  description: Joi.string().min(3).max(20),
  quantity: Joi.number().min(1),
  sold: Joi.number().min(0),
  price: Joi.number().min(1),
  category: Joi.string().hex().length(24),
  subcategory: Joi.string().hex().length(24),
  brand: Joi.string().hex().length(24),
  ratingAvg: Joi.number().min(1),
  ratingCount: Joi.number().min(1),
});

export { createProductSchema, getProductSchema, updateProductSchema };
