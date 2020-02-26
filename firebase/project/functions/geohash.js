/** @typedef {import('firebase-admin').firestore.DocumentSnapshot} DocumentSnapshot*/
/**
 * @param {DocumentSnapshot} user
 * @param {DocumentSnapshot} plog
 * @param {any} plogData
 */
async function geohashPlog(user, plog) {
    const plogData = plog.data();
}

exports.geohashPlog = geohashPlog;
