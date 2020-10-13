const admin = require('firebase-admin');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const path = require('path');
  const credsFile = path.join(__dirname, 'app-credentials.json');
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credsFile;
}

module.exports = admin.initializeApp({
  storageBucket: 'plogalong-a723a.appspot.com'
});
