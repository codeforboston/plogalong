const functions = require('firebase-functions');
const fetch = require('node-fetch');

/** @typedef {{ email: string, name?: string }} EmailAddress */

/**
 * @returns {EmailAddress}
 */
function makeEmail(r) {
  if (typeof r === 'string') {
    const m = /(.*) <([^>]+)>$/.exec(r);

    if (m)
      return { email: m[2], name: m[1] };

    return { email: r };
  }

  return r;
}

/**
 * @typedef {object} EmailOptions
 * @property {string} [apiKey]
 * @property {EmailAddress[]} recipients
 * @property {string} subject
 * @property {string} textContent
 * @property {string} [htmlContent]
 */

// https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/index.html
/**
 * @param {EmailOptions} options
 */
async function send(options) {
  const {
    sendgrid_api_key: SENDGRID_API_KEY,
    sender_email: SENDER_EMAIL,
    admin_email: ADMIN_EMAIL
  } = functions.config().plogalong || {};
  const FROM_EMAIL = makeEmail(SENDER_EMAIL || ADMIN_EMAIL);

  const content = [
    { type: 'text/plain', value: options.textContent }
  ];

  if (options.htmlContent)
    content.push({
      type: 'text/plain',
      value: options.htmlContent
    });

  const email = {
    from: FROM_EMAIL,
    personalizations: [{
      to: [].concat(options.recipients).map(makeEmail),
    }],
    subject: options.subject,
    content
  };
  console.log(JSON.stringify(email));

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${options.apiKey || SENDGRID_API_KEY}`,
      'Content-type': 'application/json'
    },
    body: JSON.stringify(email)
  });

  if (!response.ok) {
    console.error(`Received ${response.status} response from SendGrid:`,
                  await response.text().catch(_ => `<could not read response body>`));
  }
}

exports.send = send;
