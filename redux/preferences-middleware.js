import { AsyncStorage } from 'react-native';

import { SET_PREFERENCES } from './actionTypes';


export default store => next => action => {
    const result = next(action);
    if (action.type === SET_PREFERENCES) {
        AsyncStorage.setItem("com.plogalong.preferences", JSON.stringify(store.getState().preferences));
    }

    return result;
};
