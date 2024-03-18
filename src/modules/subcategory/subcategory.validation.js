import Joi from "joi";

const createSubcategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  category:Joi.string().hex().length(24).required(),
});

const getSubcategorySchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateSubcategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  category:Joi.string().hex().length(24).required(),
  id: Joi.string().hex().length(24).required(),
});

export { createSubcategorySchema, getSubcategorySchema,updateSubcategorySchema };
