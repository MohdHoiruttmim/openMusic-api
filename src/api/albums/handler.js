const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.postAlbum({ name, year });
    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler(request, h) {
    const albums = await this._service.getAlbums();
    const response = h.response({
      status: 'success',
      data: {
        albums,
      },
    });

    response.code(200);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { albumId } = request.params;

    const album = await this._service.getAlbumById(albumId);
    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });

    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
