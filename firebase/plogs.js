import db, { storage } from './init';


const plogDocToState = (plog) => {
  const data = plog.data();

  return {
    trashTypes: data.TrashTypes,
    activityType: data.ActivityType,
    location: {
      lat: data.Location.Latitude,
      lng: data.Location.Longitude,
      name: data.GeoLabel,
    },
    groupType: data.HelperType,
    pickedUp: data.PlogType === "Plog",
    when: data.DateTime.toDate(),
    plogPhotos: (data.Photos || []).map(uri => ({ uri }))
  };
};

export const getLocalPlogs = async () => {
  const plogs = await db.collection('plogs').get();

  return plogs.docs.map(plogDocToState);
};

export const getPlogs = async (userId) => {
    const plogs = await db.collection('plogs').where('UserID', '==', userId).get();

    return plogs.docs.map(plogDocToState);
};

export const savePlog = async (plog) => {
  const doc = db.collection('plogs').doc();
  await doc.set({
    TrashTypes: plog.trashTypes,
    ActivityType: plog.activityType,
    Location: {
      Latitude: plog.location.lat,
      Longitude: plog.location.lng,
    },
    GeoLabel: plog.location.name,
    HelperType: plog.groupType,
    PlogType: plog.pickedUp ?
      "Plog" :
      "Flag",
    DateTime: plog.when,
      UserID: plog.userID,
      Photos: []
  });

    const urls = [];
    let i = 0;
    for (let {uri} of plog.plogPhotos) {
        const response = await fetch(uri);

        const ref = storage.ref().child(`userdata/${plog.userID}/plog/${doc.id}-${i++}.jpg`);
        await ref.put(await response.blob());
        urls.push(await ref.getDownloadURL());
    }

    await doc.update({ Photos: urls });
};
