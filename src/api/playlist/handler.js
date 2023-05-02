const autoBind = require('auto-bind');

class PlaylistHandler {
  constructor(playlistService, songsService, validator) {
    this._playlistService = playlistService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    await this._validator.validatePlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { name } = request.payload;

    const playlistId = await this._playlistService.addPlaylist(name, credentialId);
    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });

    response.code(201);
    return response;
  }

  async getPlaylistHandler(request, h) {
    const { id: owner } = request.auth.credentials;

    const playlists = await this._playlistService.getPlaylist(owner);

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });

    response.code(200);
    return response;
  }

  async getPlaylistByIdHandler(request, h) {
    const { id: user } = request.auth.credentials;
    const { id } = request.params;

    await this._playlistService.verifyPlaylistAccess(id, user);

    const playlist = await this._playlistService.getPlaylistById(id);

    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });

    response.code(200);
    return response;
  }

  async deletePlaylistHandler(request, h) {
    const { id } = request.params;
    const { id: user } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(id, user);
    await this._playlistService.deletePlaylist(id);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    });

    response.code(200);
    return response;
  }

  async postPlaylistSongHandler(request, h) {
    await this._validator.validatePlaylistSongPayload(request.payload);
    const { id } = request.params;
    const { id: user } = request.auth.credentials;
    const { songId } = request.payload;

    await this._songsService.getSongById(songId);
    await this._playlistService.verifyPlaylistAccess(id, user);

    await this._playlistService.addPlaylistSong(id, songId);
    await this._playlistService.addPlaylistSongActivities(id, songId, user, 'add');

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });

    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request, h) {
    const { id } = request.params;
    const { id: user } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, user);
    const playlist = await this._playlistService.getPlaylistSong(id);

    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });

    response.code(200);
    return response;
  }

  async deletePlaylistSongsHandler(request, h) {
    await this._validator.validateDeletePlaylistSongPayload(request.payload);

    const { id } = request.params;
    const { id: user } = request.auth.credentials;
    const { songId } = request.payload;

    await this._playlistService.verifyPlaylistAccess(id, user);
    await this._playlistService.deletePlaylistSong(songId);
    await this._playlistService.addPlaylistSongActivities(id, songId, user, 'delete');

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    });

    response.code(200);
    return response;
  }

  async getPlaylistSongAcitvities(request, h) {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, userId);
    const activities = await this._playlistService.getPlaylistSongACtivities(playlistId);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    });

    response.code(200);
    return response;
  }
}

module.exports = PlaylistHandler;
