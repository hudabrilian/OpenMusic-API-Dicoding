const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const NotFoundError = require("../../exceptions/NotFoundError");
const {
  mapDBPlaylistToModel,
  mapDBPlaylistActivityToModel,
} = require("../../utils");

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlists VALUES ($1, $2, $3) RETURNING id",
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: "SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner LEFT JOIN collaborations ON collaborations.playlist_id = playlist_id WHERE playlists.owner = $1 OR collaborations.user_id = $1",
      values: [owner],
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapDBPlaylistToModel);
  }

  async deletePlaylistById(id) {
    const query = {
      text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
      values: [id],
    };

    await this._pool.query(query);
  }

  async addPlaylistSongs({ songId, playlistId }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlistsongs VALUES ($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Song gagal ditambahkan ke dalam playlist");
    }

    return result.rows[0].id;
  }

  async getPlaylistSongsById(id) {
    const playlistQuery = {
      text: "SELECT playlists.id, playlists.name, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner WHERE playlists.id = $1",
      values: [id],
    };
    const playlistResult = await this._pool.query(playlistQuery);

    const songsQuery = {
      text: "SELECT songs.id, songs.title, songs.performer FROM playlistsongs LEFT JOIN songs ON songs.id = playlistsongs.song_id WHERE playlist_id = $1",
      values: [id],
    };
    const songsResult = await this._pool.query(songsQuery);

    const result = {
      ...playlistResult.rows[0],
      songs: songsResult.rows,
    };

    return result;
  }

  async deletePlaylistSongsById(songId, playlistId) {
    const query = {
      text: "DELETE FROM playlistsongs WHERE song_id = $1 AND playlist_id = $2 RETURNING id",
      values: [songId, playlistId],
    };

    await this._pool.query(query);
  }

  async addPlaylistActivity({ playlistId, songId, userId, action }) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    const query = {
      text: "INSERT INTO playlist_song_activities VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Aktivitas gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getPlaylistActivities(id) {
    const query = {
      text: "SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities LEFT JOIN playlists ON playlists.id = playlist_song_activities.playlist_id LEFT JOIN songs ON songs.id = playlist_song_activities.song_id LEFT JOIN users ON users.id = playlist_song_activities.user_id WHERE playlist_song_activities.playlist_id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBPlaylistActivityToModel);
  }

  async checkPlaylistExists(id) {
    const query = {
      text: "SELECT 1 FROM playlists WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
