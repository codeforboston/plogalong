import { SET_PREFERENCES } from "../actionTypes";

/** @typedef {{
 *    conserveMemory?: boolean,
 *    sawIntro?: boolean,
 *    showDetailedOptions?: boolean,
 *    [k in string]: any
 *  }} Preferences
 */


/** @type {(state: Preferences, action: any) => Preferences} */
export default (state = {}, action) => {
    switch (action.type) {
        case SET_PREFERENCES: {
          return {
            ...state,
            ...action.payload.preferences
          };
        }

        default: {
            return state;
        }
    }
};
