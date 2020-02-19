import { auth, firebase, storage, Plogs } from './init';
const { GeoPoint } = firebase.firestore;


/**
 * @param {import('geofirestore').GeoDocumentSnapshot | firebase.firestore.QueryDocumentSnapshot} plog
 */
export const plogDocToState = (plog) => {
    const data = plog.data();
    /** @type {GeoPoint} */
    const location = data.coordinates;

    return {
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
        userProfilePicture: data.UserProfilePicture,
        userDisplayName: data.UserDisplayName,
    };
};

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
  await doc.set({
    TrashTypes: plog.trashTypes,
    ActivityType: plog.activityType,
    coordinates: new GeoPoint(plog.location.lat, plog.location.lng),
    GeoLabel: plog.location ? plog.location.name : "mid atlantic",
    HelperType: plog.groupType,
    PlogType: plog.pickedUp ?
      "Plog" :
      "Flag",
    DateTime: plog.when,
      UserID: auth.currentUser.uid,
    Photos: [],
      PlogDuration: plog.timeSpent,
      Public: !!plog.public,
      UserProfilePicture: plog.userProfilePicture,
      UserDisplayName: plog.userDisplayName,
  });

    const urls = [];
    let i = 0;
    for (let {uri} of plog.plogPhotos) {
        const response = await fetch(uri);

        const ref = storage.ref().child(`userdata/${auth.currentUser.uid}/plog/${doc.id}-${i++}.jpg`);
        await ref.put(await response.blob());
        urls.push(await ref.getDownloadURL());
    }

    await doc.update({ Photos: urls });
};
