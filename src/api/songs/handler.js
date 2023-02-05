const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    } = request.payload;
    const songId = await this._service.postSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });

    response.code(201);
    return response;
  }

  async getSongsHandler(request, h) {
    const songs = await this._service.getSongs();
    const response = h.response({
      status: 'success',
      data: {
        songs,
      },
    });

    response.code(200);
    return response;
  }

  async getSongByIdHandler(request, h) {
    const { songId } = request.params;

    const song = await this._service.getSongById(songId);
    const response = h.response({
      status: 'success',
      data: {
        song,
      },
    });

    response.code(200);
    return response;
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { songId } = request.params;
    const {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    } = request.payload;

    await this._service.putSongByid(songId, {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil diperbarui.',
    });

    response.code(200);
    return response;
  }

  async deleteSongByIdHandler(request, h) {
    const { songId } = request.params;

    await this._service.deleteSongById(songId);
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus.',
    });

    response.code(200);
    return response;
  }
}

module.exports = SongsHandler;
