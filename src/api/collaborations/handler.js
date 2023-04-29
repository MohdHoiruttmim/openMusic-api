const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, usersService, playlistService, validator) {
    this._collaborationsService = collaborationsService;
    this._userService = usersService;
    this._playlistService = playlistService;
    this._validator = validator;
    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    await this._validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
    await this._userService.getUserById(userId);
    await this._playlistService.getPlaylistById(playlistId);

    const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);
    const response = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });

    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    await this._validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaborator(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    });

    response.code(200);
    return response;
  }
}

module.exports = CollaborationsHandler;
