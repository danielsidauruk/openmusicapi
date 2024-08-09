const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const ClientError = require('../../exceptions/ClientError');

class AlbumLikesService {
  constructor(albumsService, cacheService) {
    this._pool = new Pool();
    this._albumsService = albumsService;
    this._cacheService = cacheService;
  }

  async addLike(userId, albumId) {
    await this._albumsService.getAlbumById(albumId);
    await this.verifyLike(userId, albumId);

    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to like.');
    }
    await this._cacheService.delete(`albums:${albumId}`);
    return result.rows[0].id;
  }

  async deleteLike(userId, albumId) {
    await this._albumsService.getAlbumById(albumId);
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to delete like.');
    }
    await this._cacheService.delete(`albums:${albumId}`);
  }

  async getLike(albumId) {
    try {
      const result = await this._cacheService.get(`albums:${albumId}`);
      return { likes: parseInt(result, 10), cache: true };
    } catch (error) {
      this._albumsService.getAlbumById(albumId);

      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new InvariantError('Failed to get likes.');
      }
      const integerResult = parseInt(result.rows[0].count, 10);
      await this._cacheService.set(`albums:${albumId}`, JSON.stringify(integerResult));
      return { likes: integerResult, cache: false };
    }
  }

  async verifyLike(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new ClientError('Like has been given.');
    }
  }
}

module.exports = AlbumLikesService;
