const InvariantError = require('../../exceptions/InvariantError');
const { CollaborationsSchema } = require('./schema');

const CollaborationValidator = {
  validateCollaborationPayload: (payload) => {
    const validateResult = CollaborationsSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = CollaborationValidator;
