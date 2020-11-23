import { FLASH, PAUSE_MESSAGES } from '../actionTypes';

import $M from '../../constants/Messages';


const initialState = {
  /** @type {{ text: string, stamp: number, options: any }} */
  flashMessage: null,
  paused: false,
};

export default (state = initialState, {type, payload}) => {
  switch (type) {
  default:
    const actionMessage = $M[type];

    if (!actionMessage)
      return state;

    // const originalPayload = payload;
    if (typeof actionMessage === 'string')
      payload = { text: actionMessage };
    else
      payload = actionMessage;
  case FLASH:
    return { ...state, flashMessage: payload };

  case PAUSE_MESSAGES:
    return { ...state, paused: payload };
  }
};
