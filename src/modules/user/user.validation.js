import Joi from "joi";

const validRoles = ["admin", "user"];

const createUserSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().min(3).max(30).required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .required()
    .pattern(
      new RegExp("^[a-zA-Z0-9]{8,30}$"),
      "password should be between 8 and 30 characters"
    ),
  phone: Joi.string()
    .length(11)
    .required()
    .pattern(new RegExp("^(012|010|011|015)\\d{8}$"), "egyptian numbers only"),
  role: Joi.string().valid(...validRoles),
});

const loginSchema = Joi.object({
  email: Joi.string().email().min(3).max(30).required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .required()
    .pattern(
      new RegExp("^[a-zA-Z0-9]{8,30}$"),
      "password should be between 8 and 30 characters "
    ),
});

const getUserSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateUserSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  name: Joi.string().min(3).max(20),
  email: Joi.string().email().min(3).max(30),
  phone: Joi.string()
    .length(11)
    .pattern(new RegExp("^(012|010|011|015)\\d{8}$"), "egyptian numbers only"),
});

const changePasswordSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .required()
    .pattern(
      new RegExp("^[a-zA-Z0-9]{8,30}$"),
      "password should be between 8 and 30 characters"
    ),
});

export {
  createUserSchema,
  loginSchema,
  getUserSchema,
  updateUserSchema,
  changePasswordSchema,
};
