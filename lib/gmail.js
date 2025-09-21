const { google } = require('googleapis');
const base64url = (str) => Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function sendMailFromUser(user, subject, bodyHtml, toEmail) {
  // user must have gmail_refresh_token stored in DB
  if (!user || !user.gmail_refresh_token) {
    throw new Error('User has not granted gmail.send permission');
  }
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_OAUTH_CLIENT_ID,
    process.env.GMAIL_OAUTH_CLIENT_SECRET
  );
  oAuth2Client.setCredentials({
    refresh_token: user.gmail_refresh_token
  });
  // refresh access token
  const { token } = await oAuth2Client.getAccessToken(); // returns {token, res}
  oAuth2Client.setCredentials({ access_token: token });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const messageParts = [
    `From: ${user.name} <${user.email}>`,
    `To: ${toEmail}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    bodyHtml
  ];
  const raw = base64url(messageParts.join('\r\n'));
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw }
  });
  return res.data;
}

module.exports = { sendMailFromUser };
