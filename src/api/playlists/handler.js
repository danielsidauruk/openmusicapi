const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, songsService, activitiesService, validator) {
    this.playlistsService = playlistsService;
    this.activitiesService = activitiesService;
    this.songsService = songsService;
    this.validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this.validator.validatePlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { name: playlist } = request.payload;

    const playlistId = await this.playlistsService.addPlaylist(playlist, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Successfully created playlist.',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsByOwnerHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this.playlistsService.getPlaylistsByOwner(credentialId);

    const response = h.response({
      status: 'success',
      data: { playlists },
    });
    return response;
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this.playlistsService.deletePlaylistById(playlistId);

    const response = h.response({
      status: 'success',
      message: 'Successfully deleted playlists.',
    });
    return response;
  }

  async postPlaylistSongHandler(request, h) {
    this.validator.validatePlaylistSongPayload(request.payload);

    const { songId } = request.payload;
    await this.songsService.verifySong(songId);

    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlistSongId = await this.playlistsService.addPlaylistSong(playlistId, songId);
    await this.activitiesService.addActivity(playlistId, songId, credentialId, 'add');

    const response = h.response({
      status: 'success',
      message: 'Successfully added song to playlist.',
      data: { playlistSongId },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this.playlistsService.getPlaylistById(playlistId, credentialId);
    const songs = await this.playlistsService.getPlaylistSongById(playlistId);
    playlist.songs = songs;

    const response = h.response({
      status: 'success',
      data: { playlist },
    });
    return response;
  }

  async deletePlaylistSongByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this.playlistsService.deletePlaylistSongById(songId);
    await this.activitiesService.addActivity(playlistId, songId, credentialId, 'delete');

    const response = h.response({
      status: 'success',
      message: 'Successfully deleted song from playlist.',
    });
    return response;
  }
}

module.exports = PlaylistsHandler;
