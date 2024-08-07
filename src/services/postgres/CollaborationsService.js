const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
  constructor() {
    this.pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collaboration-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };
    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Failed to add collaboration.');
    }

    return result.rows[0].id;
  }

  async deleteCollaborationById(playlistId, userId) {
    const query = {
      text: `DELETE FROM collaborations 
        WHERE playlist_id = $1 AND user_id = $2
        RETURNING id`,
      values: [playlistId, userId],
    };
    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Failed to delete collaboration.');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: `SELECT * FROM collaborations 
        WHERE user_id = $1 AND playlist_id = $2`,
      values: [userId, playlistId],
    };

    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('You don\'t have collaboration.');
    }
  }
}

module.exports = CollaborationsService;
