const mapDBAlbumToModel = ({ id, name, year }) => ({
  id,
  name,
  year,
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
