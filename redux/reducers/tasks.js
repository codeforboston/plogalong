import { UPLOAD_PROGRESS, UPLOAD_ERROR } from '../actionTypes';
const initialState = {
  uploads: {}
};


const tasks = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
  case UPLOAD_ERROR:
  case UPLOAD_PROGRESS: {
    const { uri, ...updates } = payload;

    const newState = {
      ...state,
      uploads: {
        ...state.uploads,
        [uri]: Object.assign({}, state.uploads[uri], updates)
      }
    };
    return newState;
  }

  default:
    return state;
  }
};

export default tasks;
