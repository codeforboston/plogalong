const fs = require('fs');
const https = require('https');
const path = require('path');

/**
 * @param {string} template
 * @param {{ [k in string]: string }} params
 */
const replaceParams = (template, params) => (
  template.replace(/\{([a-z0-9\-]+)\}/gi, (_, k) => params[k])
);

const GH = {
  ops: {
    listContributors: {
      path: '/repos/{owner}/{repo}/contributors',
    }
  },
  defaults: {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'bdougsand',
    },
    host: 'api.github.com',
    method: 'GET'
  }
};


/**
 * @param {https.RequestOptions} options
 *
 * @returns {Promise<Pick<https.IncomingMessage, 'statusCode' | 'statusMessage' | 'method' | 'headers'> & { body: string }>}
 */
function urlRetrieve(options) {
  return new Promise((resolve, reject) => {
    const request = https.request(options, res => {
      let data = '';

      res.on('data', chunk => { data += chunk; });
      res.on('end', () => { resolve({ body: data,
                                      statusCode: res.statusCode,
                                      statusText: res.statusMessage,
                                      method: res.method,
                                      headers: res.headers,
                                      url: res.url }); });
      res.on('error', reject);
    });

    request.on('error', reject);
    request.end();
  });
}

/**
 * @param {keyof typeof GH["ops"]} op
 */
async function github(op, params) {
  const opConfig = GH.ops[op];
  const response = await urlRetrieve(
    Object.assign(
      {
        path: replaceParams(opConfig.path, params)
      },
      GH.defaults,
    ));

  return JSON.parse(response.body);
}

async function getPlogalongContributors() {
  const contribs = await github('listContributors', {
    owner: 'codeforboston', repo: 'plogalong'
  });
  const filtered = [];
  for (const c of contribs) {
    if (c.type === 'User')
      filtered.push({
        login: c.login, avatar_url: c.avatar_url, html_url: c.html_url
      });
  }
  return filtered;
}

async function main() {
  const contribs = await getPlogalongContributors();
  const outfile = path.join(__dirname, '../constants/contributors.json');
  fs.writeFileSync(outfile, JSON.stringify(contribs));
  console.log(`Wrote ${contribs.length} contributors to ${outfile}`);
}

if (require.main === module)
  main();
