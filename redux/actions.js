// @flow
import {LOG_PLOG} from './actionTypes';

type Location = {
    lat: number,
    lng: number,
    name: ?string
}

type PlogInfo = {
    location: Location,
    when: Date,
    trashType: string[],
    activityType: string,
    groupType: string,
    plogPhotos: object[],
};



/**
 * @typedef {Object} PlogInfo
 * @property {Location} location
 * @property {}
 */
export const logPlog = (plogInfo: PlogInfo) => ({
    type: LOG_PLOG,
    payload: plogInfo
});

export default {
    logPlog
};
