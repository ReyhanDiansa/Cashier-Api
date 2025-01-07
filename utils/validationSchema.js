const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const registerSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  password_confirmation: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Password confirmation must match the password",
    }),
  role: Joi.string().valid("helper").optional(),
});

const addSizeSchema = Joi.object({
  name: Joi.string().required(),
});

const addColorSchema = Joi.object({
    name: Joi.string().required(),
  });

const addProductSchema = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().optional(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  stock: Joi.number().required(),
  colorId: Joi.optional(),
  sizeId: Joi.optional(),
});

const updateProductSchema = Joi.object({
    name: Joi.string().required(),
    sku: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.number().optional(),
    stock: Joi.number().optional(),
    colorId: Joi.optional(),
    sizeId: Joi.optional(),
});

const userUpdateSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).optional(),
  gender: Joi.string().valid("laki-laki", "perempuan").required(),
});

module.exports = {
  loginSchema,
  registerSchema,
  addSizeSchema,
  addColorSchema,
  addProductSchema,
  updateProductSchema,
  userUpdateSchema,
};
