const InvariantError = require('../../exceptions/InvariantError');
const {
  PlaylistPayloadSchema,
  PlaylistSongPayloadSchema,
  DeletePlaylistSongPayloadSchema,
} = require('./schema');

const playlistValidator = {
  validatePlaylistPayload: (payload) => {
    const validateResult = PlaylistPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
  validatePlaylistSongPayload: (payload) => {
    const validateResult = PlaylistSongPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
  validateDeletePlaylistSongPayload: (payload) => {
    const validateResult = DeletePlaylistSongPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = playlistValidator;
