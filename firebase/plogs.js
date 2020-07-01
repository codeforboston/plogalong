import { keep } from '../util/iter';

import Options from '../constants/Options';
import { auth, firebase, storage, Plogs, Plogs_ } from './init';
import { uploadImage } from './util';
const { GeoPoint } = firebase.firestore;

const { plogPhotoWidth: MaxWidth, plogPhotoHeight: MaxHeight } = Options;

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

/**
 * @typedef {object} SavePlogOptions
 * @property {(urls: string[]) => any} [uploadComplete]
 * @property {(error: any, uri?: string) => any} [uploadError]
 * @property {(uri: string, task: firebase.storage.UploadTaskSnapshot) => void} [uploadProgress]
 */

/**
 * @param  {SavePlogOptions} options
 */
export const savePlog = async (plog, options={}) => {
  const {uploadComplete, uploadError, uploadProgress} = options;
  const doc = Plogs.doc();
  const data = plogStateToDoc(plog);
  await doc.set(data);

  if (!plog.plogPhotos || !plog.plogPhotos.length)
    return doc.id;

  const dir = `${plog.public ? 'userpublic' : 'userdata'}/${auth.currentUser.uid}/plog`;
  let uploadPromise = Promise.all(plog.plogPhotos.map(({uri, width, height}, i) => {
    return uploadImage(uri, `${dir}/${doc.id}/${i}.jpg`, {
      resize: width <= MaxWidth && height <= MaxHeight ? { width: MaxWidth, height: MaxHeight } : null,
      progress: uploadProgress && (snap => uploadProgress(uri, snap))
    }).catch(reason => {
      if (uploadError)
        uploadError(reason, uri);
      else
        console.warn('error uploading', uri, reason);
    });
  })).then(urls => urls.filter(url => !!url));

  const updatePromise = uploadPromise.then(urls => doc.update({ Photos: urls }),
                                           uploadError || console.error);

  if (uploadComplete !== undefined || uploadError !== undefined)
    uploadPromise.then(uploadComplete, uploadError);
  else
    await updatePromise;

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
