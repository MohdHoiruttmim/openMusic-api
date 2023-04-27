const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationsError = require('../../exceptions/AuthorizationError');

class PlaylistService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return id;
  }

  async getPlaylist(owner) {
    const query = {
      text: 'SELECT playlist.id, playlist.name, users.username FROM playlist INNER JOIN users ON playlist.owner = users.id INNER JOIN collaborations ON collaborations.playlist_id = playlist.id WHERE users.id = $1 or collaborations.user_id = $1',
      values: [owner],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT playlist.id, playlist.name, users.username FROM playlist INNER JOIN users ON playlist.owner = users.id WHERE playlist.id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);

    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return rows[0];
  }

  async verifyPlaylistOwner(id, user) {
    const query = {
      text: 'SELECT * FROM playlist WHERE id = $1',
      values: [id],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const { owner } = rows[0];
    if (owner !== user) {
      throw new AuthorizationsError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(id, user) {
    try{
      await this._collaborationsService.verifyCollaborator(id, user);
    } catch(error) {
      try {
        await this.verifyPlaylistOwner(id, user);
      } catch(error) {
        throw error;
      }
    }
  }

  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
      values: [id],
    };

    await this._pool.query(query);
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `ps-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new InvariantError('Gagal menambahkan lagu ke dalam playlist');
    }
  }

  async getPlaylistSong(id) {
    const playlist = await this.getPlaylistById(id);
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM playlist_songs INNER JOIN songs ON playlist_songs.song_id = songs.id WHERE playlist_songs.playlist_id = $1',
      values: [id],
    };
    const { rows } = await this._pool.query(query);
    playlist.songs = rows;

    return playlist;
  }

  async deletePlaylistSong(id) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id',
      values: [id],
    };

    const { rows } = await this._pool.query(query);
    if (!rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan di dalam playlist');
    }
  }
}

module.exports = PlaylistService;
