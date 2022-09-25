const routes = (handler) => [
  {
    method: "POST",
    path: "/playlists",
    handler: (request, h) => handler.postPlaylistHandler(request, h),
    options: {
      auth: "openmusicapp_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists",
    handler: (request) => handler.getPlaylistsHandler(request),
    options: {
      auth: "openmusicapp_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{id}",
    handler: (request) => handler.deletePlaylistByIdHandler(request),
    options: {
      auth: "openmusicapp_jwt",
    },
  },
  {
    method: "POST",
    path: "/playlists/{id}/songs",
    handler: (request, h) => handler.postPlaylistSongsHandler(request, h),
    options: {
      auth: "openmusicapp_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{id}/songs",
    handler: (request) => handler.getPlaylistSongsByIdHandler(request),
    options: {
      auth: "openmusicapp_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{id}/songs",
    handler: (request) => handler.deletePlaylistSongsHandler(request),
    options: {
      auth: "openmusicapp_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{id}/activities",
    handler: (request) => handler.getPlaylistActivitiesHandler(request),
    options: {
      auth: "openmusicapp_jwt",
    },
  },
];

module.exports = routes;
