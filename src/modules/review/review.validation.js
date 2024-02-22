import Joi from "joi";

const createReviewSchema = Joi.object({
  comment: Joi.string().min(3).max(20).required(),
  product: Joi.string().hex().length(24).required(),
  ratings: Joi.number().min(0).max(5).required(),
});

const getReviewSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateReviewSchema = Joi.object({
  comment: Joi.string().min(3).max(20),
  product: Joi.string().hex().length(24),
  ratings: Joi.number().min(0).max(5),
  
});

export { createReviewSchema, getReviewSchema, updateReviewSchema };
