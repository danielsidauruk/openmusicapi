const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationsService, usersService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._usersService = usersService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationsHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._usersService.verifyUser(userId);
    await this._playlistsService.verifyPlaylist(playlistId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Collaboration added successfully.',
      data: { collaborationId },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationByIdHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._usersService.verifyUser(userId);
    await this._playlistsService.verifyPlaylist(playlistId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationsService.deleteCollaborationById(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Successfully deleted collaboration.',
    });
    return response;
  }
}

module.exports = CollaborationsHandler;
