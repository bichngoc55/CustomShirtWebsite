const Joi = require("joi");

const designValidation = {
  createDesign: Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
      "string.empty": "Design name is required",
      "string.min": "Design name must be at least 3 characters",
      "string.max": "Design name cannot exceed 50 characters",
    }),
    elements: Joi.array()
      .items(
        Joi.object({
          type: Joi.string().valid("text", "image", "clipart").required(),
          content: Joi.string().required(),
          properties: Joi.object({
            font: Joi.string().when("type", {
              is: "text",
              then: Joi.required(),
              otherwise: Joi.forbidden(),
            }),
            fontSize: Joi.number().when("type", {
              is: "text",
              then: Joi.required(),
              otherwise: Joi.forbidden(),
            }),
            color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
            position: Joi.object({
              x: Joi.number().required(),
              y: Joi.number().required(),
            }),
            rotation: Joi.number().min(0).max(360),
            scale: Joi.number().min(0.1).max(5),
          }),
        })
      )
      .min(1)
      .required(),
    // price: Joi.number().min(0).required(),
  }),
};

module.exports = designValidation;
