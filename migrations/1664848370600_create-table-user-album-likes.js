exports.up = (pgm) => {
  pgm.createTable("user_album_likes", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: '"users"',
      onDelete: "cascade",
    },
    album_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: '"albums"',
      onDelete: "cascade",
    },
  });
  pgm.createIndex("user_album_likes", "user_id");
  pgm.createIndex("user_album_likes", "album_id");
};

exports.down = (pgm) => {
  pgm.dropTable("user_album_likes");
};
