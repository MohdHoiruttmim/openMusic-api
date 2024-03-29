const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongDBToModel } = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const songId = `song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [songId, title, year, performer, genre, duration, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan lagu');
    }

    return songId;
  }

  async getSongs(title, performer) {
    if (title && performer) {
      const result = await this._pool.query(`SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE '%${title.toLowerCase()}%' AND LOWER(performer) LIKE '%${performer.toLowerCase()}%'`);
      return result.rows;
    }
    if (title) {
      const result = await this._pool.query(`SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE '%${title.toLowerCase()}%'`);
      return result.rows;
    }
    if (performer) {
      const result = await this._pool.query(`SELECT id, title, performer FROM songs WHERE LOWER(performer) LIKE '%${performer.toLowerCase()}%'`);
      return result.rows;
    }

    const result = await this._pool.query('SELECT songs.id, songs.title, songs.performer FROM songs');
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    const mappedResult = result.rows.map(mapSongDBToModel);
    return mappedResult[0];
  }

  async editSongByid(id, {
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan!');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan!');
    }
  }
}

module.exports = SongsService;
