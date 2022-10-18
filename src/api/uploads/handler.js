class UploadsHandler {
  constructor(uploadsService, albumsService, validator) {
    this._uploadsService = uploadsService;
    this._albumsService = albumsService;
    this._validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    const { cover: data } = request.payload;
    const { id: albumId } = request.params;

    this._validator.validateImageHeaders(data.hapi.headers);

    const filename = await this._uploadsService.writeFile(data, data.hapi);
    await this._albumsService.editAlbumCoverById(albumId, filename);

    const response = h.response({
      status: "success",
      message: "Sampul berhasil diunggah",
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
