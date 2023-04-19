const InvariantError = require('../../exceptions/InvariantError');
const { postAuthenticationSchema, putAuthenticationSchema, deleteAuthenticationSchema } = require('./schema');

const AuthenticationsValidator = {
  validatePostPayload: (payload) => {
    const validationResult = postAuthenticationSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePutPayload: (payload) => {
    const validationResult = putAuthenticationSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateDeletePayload: (payload) => {
    const validationResult = deleteAuthenticationSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthenticationsValidator;
