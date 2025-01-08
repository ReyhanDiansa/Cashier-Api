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
  role: Joi.string().valid("helper", "admin").optional(),
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
  stock: Joi.number().integer().positive().optional(),
  colorId: Joi.optional(),
  sizeId: Joi.optional(),
});

const userUpdateSchema = Joi.object({
  username: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).optional(),
  role: Joi.string().valid("admin", "helper").optional(),
});

const addOrderSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().min(10).optional(),
  email: Joi.string().email().required(),
  address: Joi.string().optional(),
  detail: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().required(),
        quantity: Joi.number().integer().positive().required(),
      })
    )
    .required(),
});

const updateOrderSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string().min(10).optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().email().optional(),
  detail: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().integer().required(),
        quantity: Joi.number().integer().positive().required(),
      })
    )
    .optional(),
});

const addUserSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid("helper", "admin").optional(),
});

module.exports = {
  loginSchema,
  registerSchema,
  addSizeSchema,
  addColorSchema,
  addProductSchema,
  updateProductSchema,
  userUpdateSchema,
  addOrderSchema,
  updateOrderSchema,
  addUserSchema
};
