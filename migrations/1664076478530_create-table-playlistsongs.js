exports.up = (pgm) => {
  pgm.createTable("playlistsongs", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: '"playlists"',
      onDelete: "cascade",
    },
    song_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: '"songs"',
      onDelete: "cascade",
    },
  });
  pgm.createIndex("playlistsongs", "playlist_id");
  pgm.createIndex("playlistsongs", "song_id");
};

exports.down = (pgm) => {
  pgm.dropTable("playlistsongs");
};
