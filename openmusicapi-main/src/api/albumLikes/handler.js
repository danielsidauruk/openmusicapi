const autoBind = require('auto-bind');

class AlbumLikesHandler {
  constructor(service) {
    this._service = service;

    autoBind(this);
  }

  async postAlbumLikesHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    const likeId = await this._service.addLike(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'The album was liked successfully.',
      data: {
        likeId,
      },
    });
    response.code(201);
    return response;
  }

  async getLikeAlbumHandler(request, h) {
    const { id: albumId } = request.params;

    const { likes, cache } = await this._service.getLike(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    if (cache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }

  async deleteLikeAlbumHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.deleteLike(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'The Album\'s like was deleted successfully.',
    });
    response.code(200);
    return response;
  }
}

module.exports = AlbumLikesHandler;
