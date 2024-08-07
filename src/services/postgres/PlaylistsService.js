const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(collaborationsService) {
    this.pool = new Pool();
    this.collaborationsService = collaborationsService;
  }

  async addPlaylist(playlist, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, playlist, owner],
    };
    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to add playlist.');
    }

    return result.rows[0].id;
  }

  async getPlaylistsByOwner(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
        LEFT JOIN users ON users.id = playlists.owner
        FULL JOIN collaborations ON playlists.id = collaborations.playlist_id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };
    const result = await this.pool.query(query);

    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      JOIN users ON playlists.owner = users.id
      WHERE playlists.id = $1`,
      values: [id],
    };

    const result = await this.pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found.');
    }

    return result.rows[0];
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to delete playlist.');
    }
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlist_song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to add Playlist Song.');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongById(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlistsongs
        JOIN songs ON playlistsongs.song_id = songs.id 
        WHERE playlistsongs.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this.pool.query(query);

    return result.rows;
  }

  async deletePlaylistSongById(songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE song_id = $1 RETURNING id',
      values: [songId],
    };
    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to delete Playlist song.');
    }
  }

  async verifyPlaylistOwner(playlistId, ownerId) {
    await this.verifyPlaylist(playlistId);

    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };
    const result = await this.pool.query(query);

    const { owner } = result.rows[0];
    if (owner !== ownerId) {
      throw new AuthorizationError('You dont\'t have the access.');
    }
  }

  async verifyPlaylistAccess(playlistId, ownerId) {
    try {
      await this.verifyPlaylistOwner(playlistId, ownerId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this.collaborationsService.verifyCollaborator(playlistId, ownerId);
      } catch {
        throw error;
      }
    }
  }

  async verifyPlaylist(playlistId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist not found.');
    }
  }
}

module.exports = PlaylistsService;
