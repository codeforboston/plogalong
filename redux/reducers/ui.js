import { FLASH } from '../actionTypes';

const initialState = {
  flashMessage: null
};

export default (state = initialState, {type, payload}) => {
  switch (type) {
  case FLASH:
    return { ...state, flashMessage: payload };
  default:
    return state;
  }
};
