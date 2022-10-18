const config = require("./config");

const mapDBAlbumToModel = ({ id, name, year, cover }) => ({
  id,
  name,
  year,
  coverUrl: cover
    ? `http://${config.app.host}:${config.app.port}/upload/albums/${cover}`
    : null,
});

const mapDBSongToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

const mapDBPlaylistToModel = ({ id, name, username }) => ({
  id,
  name,
  username,
});

const mapDBPlaylistActivityToModel = ({ username, title, action, time }) => ({
  username,
  title,
  action,
  time,
});

module.exports = {
  mapDBAlbumToModel,
  mapDBSongToModel,
  mapDBPlaylistToModel,
  mapDBPlaylistActivityToModel,
};
