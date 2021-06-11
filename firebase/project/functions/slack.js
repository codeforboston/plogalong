/**
 * @typedef {{ comment: string, email: string, label: string, name: string, topic: string }} Comment
 */

/**
 * @param {Comment} comment
 */
async function postComment(comment) {
  const fetch = require('node-fetch');
  const functions = require('firebase-functions');

  const { slack_webhook } = functions.config().plogalong || {};
  if (!slack_webhook)
    return;

  // TODO Comment out Markdown characters in comment fields
  const {
    name = '_Anonymous user_',
    email,
  } = comment;
  const body = JSON.stringify({
    blocks: [
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*From*\n${name}` + (email ? ` (_${email}_)` : '') },
          { type: 'mrkdwn', text: `*Category*\n${comment.topic}` },
          { type: 'mrkdwn', text: comment.comment },
        ]
      }
    ]
  });
  console.log('body:', body);
  await fetch(slack_webhook, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body
  });
}

exports.postComment = postComment;
