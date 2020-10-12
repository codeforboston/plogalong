const app = require('./app');

const auth = app.auth();


async function listUsers() {
  const maxResults = 100;
  /** @type {string} */
  let pageToken;
  while (true) {
    const result = await auth.listUsers(maxResults, pageToken);
    pageToken = result.pageToken;
    const users = result.users;
    for (const user of result.users) {
      console.log(user.uid, user.email, user.emailVerified ? '' : '(unverified)');
    }

    if (users.length < maxResults)
      break;
  }

  console.log('done');
}

listUsers();
