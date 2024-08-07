const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, usersService, playlistsService, validator) {
    this.collaborationsService = collaborationsService;
    this.usersService = usersService;
    this.playlistsService = playlistsService;
    this.validator = validator;

    autoBind(this);
  }

  async postCollaborationsHandler(request, h) {
    this.validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.usersService.verifyUser(userId);
    await this.playlistsService.verifyPlaylist(playlistId);
    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const collaborationId = await this.collaborationsService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Collaboration added successfully.',
      data: { collaborationId },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationByIdHandler(request, h) {
    this.validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.usersService.verifyUser(userId);
    await this.playlistsService.verifyPlaylist(playlistId);
    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this.collaborationsService.deleteCollaborationById(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Successfully deleted collaboration.',
    });
    return response;
  }
}

module.exports = CollaborationsHandler;
