import Joi from "joi";

const createBrandSchema = Joi.object({
  name: Joi.string().min(2).max(20).required(),
  category: Joi.string().hex().length(24).required(),
});

const getBrandSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateBrandSchema = Joi.object({
  name: Joi.string().min(2).max(20),
  category: Joi.string().hex().length(24),
  id: Joi.string().hex().length(24).required(),
});

export { createBrandSchema, getBrandSchema, updateBrandSchema };
