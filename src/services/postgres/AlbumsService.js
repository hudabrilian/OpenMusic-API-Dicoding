/* eslint-disable radix */
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { mapDBAlbumToModel, mapDBSongToModel } = require("../../utils");

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: "INSERT INTO albums VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      values: [id, name, year, null, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };
    const albumResult = await this._pool.query(query);

    if (!albumResult.rowCount) {
      throw new NotFoundError("Album tidak ditemukan");
    }

    const query2 = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [id],
    };

    const songsResult = await this._pool.query(query2);

    const albums = albumResult.rows.map(mapDBAlbumToModel)[0];

    const results =
      songsResult.rowCount > 0
        ? {
            ...albums,
            songs: songsResult.rows.map(mapDBSongToModel),
          }
        : albums;

    return results;
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: "UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id",
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }
  }

  async editAlbumCoverById(id, filename) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: "UPDATE albums SET cover = $1, updated_at = $2 WHERE id = $3 RETURNING id",
      values: [filename, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
    }
  }

  async likeAlbumById(albumId, userId) {
    const selectLikeQuery = {
      text: "SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
      values: [userId, albumId],
    };

    const selectLikeResult = await this._pool.query(selectLikeQuery);

    if (!selectLikeResult.rowCount) {
      const id = `albumlikes-${nanoid(16)}`;
      const likeQuery = {
        text: "INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id",
        values: [id, userId, albumId],
      };

      await this._pool.query(likeQuery);
    } else {
      const removeLikeQuery = {
        text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id",
        values: [userId, albumId],
      };

      await this._pool.query(removeLikeQuery);
    }

    await this._cacheService.delete(`albumLikes:${albumId}`);
  }

  async getAlbumLikesById(id) {
    try {
      const result = await this._cacheService.get(`albumLikes:${id}`);
      return {
        likes: parseInt(result),
        cache: true,
      };
    } catch (error) {
      const query = {
        text: "SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1",
        values: [id],
      };

      const result = await this._pool.query(query);

      const likes = parseInt(result.rows[0].count);

      await this._cacheService.set(`albumLikes:${id}`, likes);

      return {
        likes,
        cache: false,
      };
    }
  }

  async checkAlbumExists(id) {
    const query = {
      text: "SELECT 1 FROM albums WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("Album tidak ditemukan");
    }
  }
}

module.exports = AlbumsService;
