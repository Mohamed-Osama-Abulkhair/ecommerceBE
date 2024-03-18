import Joi from "joi";

const nameSchema = Joi.string().min(3).max(30).trim();
const emailSchema = Joi.string().email().min(5).max(100).trim();
const passwordSchema = Joi.string()
  .min(8)
  .max(30)
  .trim()
  .replace(/\s/g, "")
  .pattern(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[a-zA-Z])\S{8,}$/,
    "password should be at least 8 characters and contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
  );
const phoneSchema = Joi.string()
  .length(11)
  .pattern(new RegExp("^(012|010|011|015)\\d{8}$"), "egyptian numbers only");
const idSchema = Joi.string().hex().length(24).required();

const createUserSchema = Joi.object({
  name: nameSchema.required(),
  email: emailSchema.required(),
  password: passwordSchema.required(),
  phone: phoneSchema.required(),
});

const loginSchema = Joi.object({
  email: emailSchema.required(),
  password: passwordSchema.required(),
});

const getUserSchema = Joi.object({
  id: idSchema,
});

const updateUserSchema = Joi.object({
  id: idSchema,
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
});

const changePasswordSchema = Joi.object({
  id: idSchema,
  oldPassword: passwordSchema,
  newPassword: passwordSchema.required(),
});

const forgetPasswordSchema = Joi.object({
  email: emailSchema.required(),
});

const verForgetPasswordSchema = Joi.object({
  email: emailSchema.required(),
  newPassword: passwordSchema.required(),
  otpCode: Joi.string()
    .length(6)
    .required()
    .pattern(/^\d{6}$/, "6 numbers only"),
});

export {
  createUserSchema,
  loginSchema,
  getUserSchema,
  updateUserSchema,
  changePasswordSchema,
  forgetPasswordSchema,
  verForgetPasswordSchema,
};
