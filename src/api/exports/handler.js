const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(ExportsService, playlistService, validator) {
    this._exportService = ExportsService;
    this._playlistService = playlistService;
    this._validator = validator;

    autoBind(this);
  }

  async sendEmailHandler(request, h) {
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;
    const { id: userId } = request.auth.credentials;

    this._validator.validateExportPayload(request.payload);
    await this._playlistService.verifyPlaylistAccess(playlistId, userId);

    const message = {
      playlistId,
      targetEmail,
    };

    await this._exportService.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses.',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
