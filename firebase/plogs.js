import db from './init';


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
  const result = await doc.set({
    TrashTypes: plog.trashTypes.toJS(),
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
      UserID: plog.userID
  });

  const data = await doc.get();
};
