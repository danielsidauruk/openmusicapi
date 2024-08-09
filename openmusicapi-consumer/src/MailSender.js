const nodemailer = require('nodemailer');

class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  sendEmail(targetEmail, content) {
    const message = {
      from: 'OpenMusicAPIv3',
      to: targetEmail,
      subject: 'Export Playlist',
      text: 'Attached is the result of the playlist export.',
      attachments: {
        filename: 'playlist.json',
        content,
      },
    };
    return this._transporter.sendMail(message);
  }
}

module.exports = MailSender;
