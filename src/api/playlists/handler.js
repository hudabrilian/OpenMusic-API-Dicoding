class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner: credentialId,
    });

    const response = h.response({
      status: "success",
      message: "Playlist berhasil ditambahkan",
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);

    return {
      status: "success",
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.checkPlaylistExists(id);
    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);

    return {
      status: "success",
      message: "Playlist berhasil dihapus",
    };
  }

  async postPlaylistSongsHandler(request, h) {
    this._validator.validatePlaylistSongs(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._songsService.checkSongExists(songId);
    await this._playlistsService.checkPlaylistExists(id);
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    const playlistId = await this._playlistsService.addPlaylistSongs({
      songId,
      playlistId: id,
    });

    await this._playlistsService.addPlaylistActivity({
      playlistId: id,
      songId,
      userId: credentialId,
      action: "add",
    });

    const response = h.response({
      status: "success",
      message: "Song berhasil ditambahkan ke dalam playlist",
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.checkPlaylistExists(id);
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._playlistsService.getPlaylistSongsById(id);

    return {
      status: "success",
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongsHandler(request) {
    this._validator.validatePlaylistSongs(request.payload);

    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._playlistsService.checkPlaylistExists(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._playlistsService.deletePlaylistSongsById(songId, playlistId);

    await this._playlistsService.addPlaylistActivity({
      playlistId,
      songId,
      userId: credentialId,
      action: "delete",
    });

    return {
      status: "success",
      message: "Song berhasil dihapus dari playlist",
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._playlistsService.checkPlaylistExists(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const activities = await this._playlistsService.getPlaylistActivities(
      playlistId
    );

    return {
      status: "success",
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
