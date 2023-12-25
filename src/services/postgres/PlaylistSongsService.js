const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, songId) {
    const songQuery = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };
    const songQueryResult = await this._pool.query(songQuery);

    if (!songQueryResult.rows[0]) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    const id = nanoid(16);

    const playlistQuery = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const playlistQueryResult = await this._pool.query(playlistQuery);

    if (!playlistQueryResult.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return playlistQueryResult.rows[0].id;
  }

  async getSongsInPlaylist(playlistId, playlist) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM playlist_songs
      JOIN songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: result.rows,
    }
  }

  async deleteSongInPlaylist(songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING song_id',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Lagu tidak dapat dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongsService;
