const admin = require('firebase-admin');
const app = admin.initializeApp();

const db = app.firestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = app;
