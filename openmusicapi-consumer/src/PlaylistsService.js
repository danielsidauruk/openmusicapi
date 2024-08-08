const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT id, name FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getPlaylistSongById(id) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM playlistsongs
        JOIN songs ON playlistsongs.song_id = songs.id 
        WHERE playlistsongs.playlist_id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistsService;
