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

module.exports = { mapDBAlbumToModel, mapDBSongToModel };
