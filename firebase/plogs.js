import { keep } from '../util/iter';

import { auth, firebase, storage, Plogs, Plogs_ } from './init';
import { uploadImage } from './util';
const { GeoPoint } = firebase.firestore;


/**
 * @param {import('geofirestore').GeoDocumentSnapshot | firebase.firestore.QueryDocumentSnapshot} plog
 */
export const plogDocToState = (plog) => {
  let data = plog.data();
  if (data.d) data = data.d;
  /** @type {GeoPoint} */
  const location = data.coordinates;
  const plogPhotos = keep(
    uri => (uri && uri.match(/^https:\/\//) && { uri }),
    (data.Photos || []));

  return {
    id: plog.id,
    trashTypes: data.TrashTypes,
    activityType: data.ActivityType,
    location: {
      lat: location.latitude,
      lng: location.longitude,
      name: data.GeoLabel,
    },
    groupType: data.HelperType,
    pickedUp: data.PlogType === "Plog",
    when: data.DateTime.toDate(),
    plogPhotos,
    timeSpent: data.PlogDuration,
    saving: plog.metadata && plog.metadata.hasPendingWrites,
    userID: data.UserID,
    public: data.Public,
    likeCount: data.likeCount || 0,
    userProfilePicture: data.UserProfilePicture,
    userDisplayName: data.UserDisplayName,
  };
};

export const plogStateToDoc = plog => ({
  TrashTypes: plog.trashTypes,
  ActivityType: plog.activityType,
  coordinates: new GeoPoint(plog.location.lat, plog.location.lng),
  GeoLabel: plog.location ? plog.location.name : "mid atlantic",
  HelperType: plog.groupType,
  PlogType: plog.pickedUp ?
    "Plog" :
    "Flag",
  DateTime: new firebase.firestore.Timestamp.fromDate(plog.when),
  TZ: plog.when.getTimezoneOffset(),
  UserID: auth.currentUser.uid,
  Photos: [],
  PlogDuration: plog.timeSpent,
  Public: !!plog.public,
  UserProfilePicture: plog.userProfilePicture || null,
  UserDisplayName: plog.userDisplayName || null,
});

export function queryUserPlogs(userId) {
  return Plogs_.where('d.UserID', '==', userId).orderBy('d.DateTime', 'desc');
}

export const getLocalPlogs = (lat=42.123, long=-71.1234, radius=100) => {
  return Plogs.near({
    center: new GeoPoint(lat, long),
    radius
  })
    .where('Public', '==', true);
};

export const savePlog = async (plog, uploadComplete, uploadError) => {
  const doc = Plogs.doc();
  const data = plogStateToDoc(plog);
  await doc.set(data);

  if (!plog.plogPhotos || !plog.plogPhotos.length)
    return doc.id;

  const dir = `${plog.public ? 'userpublic' : 'userdata'}/${auth.currentUser.uid}/plog`;
  let uploadPromise = Promise.all(plog.plogPhotos.map(({uri, width, height}, i) => (
    uploadImage(uri, `${dir}/${doc.id}/${i}.jpg`,
                width <= 300 && height <= 300 ? { resize: { width: 300, height: 300 } } : {})
  ))).then(urls => doc.update({ Photos: urls }));

  if (uploadComplete !== undefined || uploadError !== undefined)
    await uploadPromise;
  else
    uploadPromise = uploadPromise.then(uploadComplete, uploadError);

  return doc.id;
};

/**
 * @param {{ id: string, userID: string, public: boolean, plogPhotos: { uri: string }[] }} plog
 */
export const deletePlog = async plog=> {
  await Plogs.doc(plog.id).delete();
  for (const {uri} of plog.plogPhotos) {
    const ref = storage.refFromURL(uri);
    return ref.delete().catch(console.warn);
  }
};
