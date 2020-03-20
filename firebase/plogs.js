import * as ImageManipulator from 'expo-image-manipulator';

import { auth, firebase, storage, Plogs, firestore } from './init';
import { uploadImage } from './util';
const { GeoPoint } = firebase.firestore;


/**
 * @param {import('geofirestore').GeoDocumentSnapshot | firebase.firestore.QueryDocumentSnapshot} plog
 */
export const plogDocToState = (plog) => {
  const data = plog.data();
  /** @type {GeoPoint} */
  const location = data.coordinates;

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
    plogPhotos: (data.Photos || []).map(uri => ({ uri })),
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
  DateTime: new firebase.firestore.Timestamp(Math.floor(plog.when.getTime()/1000)),
  TZ: plog.when.getTimezoneOffset(),
  UserID: auth.currentUser.uid,
  Photos: [],
  PlogDuration: plog.timeSpent,
  Public: !!plog.public,
  UserProfilePicture: plog.userProfilePicture || null,
  UserDisplayName: plog.userDisplayName,
});

export function queryUserPlogs(userId) {
  return Plogs.where('UserID', '==', userId);
}

export const getLocalPlogs = (lat=42.123, long=-71.1234, radius=8000) => {
  return Plogs.near({
    center: new GeoPoint(lat, long),
    radius
  })
    .where('Public', '==', true);
};

export const savePlog = async (plog) => {
  const doc = Plogs.doc();
  console.log(plog.when);
  await doc.set(plogStateToDoc(plog));

  if (!plog.plogPhotos || !plog.plogPhotos.length)
      return;


  const dir = `${plog.public ? 'userpublic' : 'userdata'}/${auth.currentUser.uid}/plog`;
  const urls = await Promise.all(plog.plogPhotos.map(({uri, width, height}, i) => (
    width <= 300 && height <= 300 ?
      uri :
      uploadImage(uri, `${dir}/${doc.id}-${i}.jpg`,
                  { resize: { width: 300, height: 300 } })
  )));

  await doc.update({ Photos: urls });
};
