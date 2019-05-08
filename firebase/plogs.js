import db from './init';

import { PlogInfo } from '../redux/actions';

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

export const getPlogs = async () => {
  const plogs = await db.collection('plogs').get();

  return plogs.docs.map(plogDocToState);
};

export const savePlog = async (plog: PlogInfo) => {
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
  });

  const data = await doc.get();

  console.log({ 
    doc: plogDocToState(data),
   });
  
};
