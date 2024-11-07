const Joi = require("joi");

const orderValidation = {
  createOrder: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          itemType: Joi.string().valid("store", "custom").required(),
          product: Joi.string().required(),
          size: Joi.string().valid("XS", "S", "M", "L", "XL", "XXL").required(),
          color: Joi.string().valid("black", "white").required(),
          quantity: Joi.number().min(1).required(),
        })
      )
      .min(1)
      .required(),
    shippingAddress: Joi.object({
      fullName: Joi.string().required(),
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
      phone: Joi.string()
        .pattern(/^\+?[\d\s-]+$/)
        .required(),
    }),
    shippingMethod: Joi.string().valid("standard", "budget", "fast").required(),
    paymentDetails: Joi.object({
      method: Joi.string().valid("Cash", "Digital", "Credit_Card").required(),
    }),
  }),
};

module.exports = orderValidation;
