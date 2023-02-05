const InvariantError = require('../../exceptions/InvariantError');
const { SongPayloadSchema } = require('../schema');

const songsValidator = {
  validateSongPayload: (payload) => {
    const validateSongResult = SongPayloadSchema.validate(payload);
    if (validateSongResult.error) {
      throw new InvariantError(validateSongResult.error.message);
    }
  },
};

module.exports = songsValidator;
