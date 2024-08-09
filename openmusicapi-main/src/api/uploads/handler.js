const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;
    this._validator.validateCoverPayload(cover.hapi.headers);

    const coverUrl = await this._storageService.writeFile(cover, cover.hapi);
    await this._albumsService.updateAlbumCover(coverUrl, id);

    const response = h.response({
      status: 'success',
      message: 'Album Cover added Successfully',
      data: {
        coverUrl,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
