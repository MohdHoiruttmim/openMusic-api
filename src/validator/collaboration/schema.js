const Joi = require('joi');

const CollaborationsSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { CollaborationsSchema };
