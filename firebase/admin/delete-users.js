const app = require('./app');

const auth = app.auth();


async function deleteAllUsers() {
  const maxResults = 100;
  /** @type {string} */
  let pageToken;
  while (true) {
    const result = await auth.listUsers(maxResults, pageToken);
    pageToken = result.pageToken;
    const users = result.users;
    console.log('Deleting', users.length, 'users');
    await auth.deleteUsers(users.map(u => u.uid));

    if (users.length < maxResults)
      break;
  }

  console.log('done');
}

// deleteAllUsers();
