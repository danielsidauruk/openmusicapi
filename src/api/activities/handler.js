/* eslint-disable no-unused-vars */
const autoBind = require('auto-bind');

class ActivitiesHandler {
  constructor(playlistsService, activitiesService) {
    this.playlistsService = playlistsService;
    this.activitiesService = activitiesService;
    autoBind(this);
  }

  async getPlaylistActivitiesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const activities = await this.activitiesService.getActivitiesByPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = ActivitiesHandler;
