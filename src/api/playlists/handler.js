class PlaylistsHandler {
  constructor(
    PlaylistsService,
    PlaylistSongsService,
    validator,
  ) {
    this._playlistsService = PlaylistsService;
    this._playlistSongsService = PlaylistSongsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    await this._validator.validatePlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { name } = request.payload;

    const playlistId = await this._playlistsService.addPlaylist(name, { owner: credentialId });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;

    const playlists = await this._playlistsService.getPlaylists({ owner: credentialId });

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._playlistsService.verifyPlaylistOwner(id, { owner: credentialId });

    await this._playlistsService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(request, h) {
    await this._validator.validatePlaylistSongPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._playlistsService.verifyPlaylistOwner(id, { owner: credentialId });

    const { songId } = request.payload;

    const playlistSongsId = await this._playlistSongsService.addSongToPlaylist(id, songId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
      data: {
        playlistSongsId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._playlistsService.verifyPlaylistOwner(id, { owner: credentialId });

    const playlist = await this._playlistsService.getPlaylistById(id);
    const playlistWithSongs = await this._playlistSongsService.getSongsInPlaylist(id, playlist);

    return {
      status: 'success',
      data: {
        playlist: playlistWithSongs,
      },
    };
  }

  async deletePlaylistSongHandler(request) {
    await this._validator.validatePlaylistSongPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._playlistsService.verifyPlaylistOwner(id, { owner: credentialId });

    const { songId } = request.payload;

    await this._playlistSongsService.deleteSongInPlaylist(songId);

    return {
      status: 'success',
      message: 'Lagu di dalam playlist berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;
