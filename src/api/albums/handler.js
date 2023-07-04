const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator, uploadService, uploadValidator) {
    this._service = service;
    this._validator = validator;
    this._uploadService = uploadService;
    this._uploadValidator = uploadValidator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });
    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async postUploadImageHandler(request, h) {
    const { cover } = request.payload;
    const { id: albumId } = request.params;
    this._uploadValidator.validateUploadPayload(cover.hapi.headers);
    await this._service.getAlbumById(albumId);

    const result = await this._uploadService.writeFile(cover, cover.hapi);

    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/covers/images/${result}`;
    await this._service.addAlbumCover(albumId, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postAlbumLikesHandler(request, h) {
    const { albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.getAlbumById(albumId);
    await this._service.addAlbumLike(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Menyukai album',
    });
    response.code(201);
    return response;
  }

  async unlikeAlbumHandler(request, h) {
    const { albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.deleteAlbumLike(albumId, userId);
    const response = h.response({
      status: 'success',
      message: 'Batal menyukai album',
    });
    response.code(200);
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

  async getAlbumLikeHandler(request, h) {
    const { albumId } = request.params;

    const { data, source } = await this._service.getAlbumLike(albumId);
    const response = h.response({
      status: 'success',
      data,
    });
    if (source) { response.header('X-Data-Source', source); }
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { albumId } = request.params;

    await this._service.editAlbumById(albumId, request.payload);
    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    });

    response.code(200);
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { albumId } = request.params;

    await this._service.deleteAlbumById(albumId);
    const response = h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });

    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
