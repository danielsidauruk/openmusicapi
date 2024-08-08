class Listener {
  constructor(service, mailSender) {
    this._service = service;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      const playlist = await this._service.getPlaylistById(playlistId);
      const songs = await this._service.getPlaylistSongById(playlistId);
      playlist.songs = songs;

      const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify({ playlist }));
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
