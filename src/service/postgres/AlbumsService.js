const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumDBToModel } = require('../../utils');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows;
  }

  async getAlbumLike(albumId) {
    try {
      const result = await this._cacheService.get(`album:${albumId}`);
      return {
        data: JSON.parse(result),
        source: 'cache',
      };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(id) AS likes FROM user_album_likes WHERE album_id = $1 GROUP BY(album_id)',
        values: [albumId],
      };

      const { rows } = await this._pool.query(query);
      rows[0].likes = Number(rows[0].likes);

      await this._cacheService.set(`album:${albumId}`, JSON.stringify(rows[0]));
      return { data: rows[0] };
    }
  }

  async addAlbum({ name, year }) {
    const albumId = 'album-'.concat(nanoid(16));

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [albumId, name, year],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan album');
    }

    return albumId;
  }

  async addAlbumCover(albumId, url) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2',
      values: [url, albumId],
    };

    const { rowCount } = await this._pool.query(query);
    if (rowCount === 0) {
      throw new InvariantError('Gagal menambahkan cover album');
    }
  }

  async addAlbumLike(albumId, userId) {
    const likeId = `like-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [likeId, userId, albumId],
    };

    try {
      const { rows } = await this._pool.query(query);
      await this._cacheService.delete(`album:${albumId}`);
      if (!rows.length) {
        throw new InvariantError('Gagal menyukai album');
      }
    } catch (error) {
      throw new InvariantError('User mencoba menyukai album yang sama');
    }
  }

  async getAlbumById(id) {
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const albumResult = await this._pool.query(albumQuery);
    if (albumResult.rows.length === 0) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const albumMapResult = albumResult.rows.map(mapAlbumDBToModel);

    const songsQuery = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const songsResult = await this._pool.query(songsQuery);
    albumMapResult[0].songs = songsResult.rows;

    return albumMapResult[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const { rows } = await this._pool.query(query);
    await this._cacheService.delete(`album:${albumId}`);
    if (!rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
