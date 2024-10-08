const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/NotFoundError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, NULL) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album failed to add.');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT id, name, year FROM albums');
    return result.rows;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album not found.');
    }

    result.rows[0].coverUrl = result.rows[0].coverurl;
    delete result.rows[0].coverurl;

    return result.rows[0];
  }

  async getSongsInAlbum(id) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE "album_id" = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async editAlbumById(id, {
    name, year,
  }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update album. Id not found.');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete album. Id not found.');
    }
  }

  async updateAlbumCover(coverUrl, albumId) {
    const query = {
      text: 'UPDATE albums SET coverurl = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to add album cover.');
    }
  }
}

module.exports = AlbumsService;
