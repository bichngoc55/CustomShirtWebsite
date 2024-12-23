const Joi = require("joi");

const shirtValidation = {
  createProduct: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    basePrice: Joi.number().min(0).required(),
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        altText: Joi.string().required(),
        isDefault: Joi.boolean(),
      })
    ),
    size: Joi.string().valid("XS", "S", "M", "L", "XL", "XXL").required(),
    color: Joi.object({
      name: Joi.string().required(),
      hexCode: Joi.string()
        .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .required(),
    }),
    quantityAvailable: Joi.number().min(0).required(),
    isActive: Joi.boolean(),
    featured: Joi.boolean(),
  }),
};

module.exports = shirtValidation;
