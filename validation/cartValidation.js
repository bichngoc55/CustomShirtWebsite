const Joi = require("joi");

const cartValidation = {
  addToCart: {
    body: Joi.object({
      userId: Joi.string().required(),
      productId: Joi.string().required(),
      selectedSize: Joi.string().required(),
      selectedColor: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
    }),
  },

  removeFromCart: {
    body: Joi.object({
      productId: Joi.string().required(),
      selectedSize: Joi.string().required(),
      selectedColor: Joi.string().required(),
    }),
  },

  validateRequest: (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
        });
      }
      next();
    };
  },
};

module.exports = cartValidation;
