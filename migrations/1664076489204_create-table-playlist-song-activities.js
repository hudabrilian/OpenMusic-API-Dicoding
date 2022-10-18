/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable("playlist_song_activities", {
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
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: '"users"',
      onDelete: "cascade",
    },
    action: {
      type: "TEXT",
      notNull: true,
    },
    time: {
      type: "TEXT",
      notNull: true,
    },
  });
  pgm.createIndex("playlist_song_activities", "playlist_id");
  pgm.createIndex("playlist_song_activities", "song_id");
  pgm.createIndex("playlist_song_activities", "user_id");
};

exports.down = (pgm) => {
  pgm.dropTable("playlist_song_activities");
};
