const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { mapDBSongToModel } = require("../../utils");

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: "INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id",
      values: [id, title, year, performer, genre, duration, albumId, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Song gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getSongs(title = "", performer = "") {
    const query = {
      text: "SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2",
      values: [`%${title}%`, `%${performer}%`],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Song tidak ditemukan");
    }

    return result.rows.map(mapDBSongToModel)[0];
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    if (albumId) {
      const checkAlbum = await this._pool.query({
        text: "SELECT 1 FROM albums WHERE id = $1",
        values: [albumId],
      });

      if (!checkAlbum.rows.length) {
        throw new NotFoundError("Album tidak ditemukan");
      }

      const updatedAt = new Date().toISOString();
      const query = {
        text: "UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, albumId = $6, updated_at = $7 WHERE id = $8 RETURNING id",
        values: [
          title,
          year,
          performer,
          genre,
          duration,
          albumId,
          updatedAt,
          id,
        ],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError("Gagal memperbarui song. Id tidak ditemukan");
      }
    }

    const updatedAt = new Date().toISOString();
    const query = {
      text: "UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id",
      values: [title, year, performer, genre, duration, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui song. Id tidak ditemukan");
    }
  }

  async deleteSongById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Song gagal dihapus. Id tidak ditemukan");
    }
  }

  async checkSongExists(songId) {
    const query = {
      text: "SELECT 1 FROM songs WHERE id = $1",
      values: [songId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Song tidak ditemukan");
    }
  }
}

module.exports = SongsService;
