const Joi = require('joi');

const postAuthenticationSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const putAuthenticationSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const deleteAuthenticationSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  postAuthenticationSchema,
  putAuthenticationSchema,
  deleteAuthenticationSchema,
};
