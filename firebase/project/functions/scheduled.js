const functions = require('firebase-functions');
const app = require('./app');

functions.pubsub
  .schedule('every day 03:00')
  .timeZone('America/New_York')
  .onRun(
    async context => {
      console.log('Cleaning up inactive users...');
      const results = await deleteInactiveUsers();
      console.log(results);
    });
