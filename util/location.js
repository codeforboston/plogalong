import {Address} from 'expo-location';

/** @type {(keyof Address)[]} */
const precedence = ['city', 'region', 'country'];

/**
 * @param {Address} address
 */
export function formatAddress(address) {
   if (address) {
    const {street, name} = address;

    if (street) {
      if (name && !name.match(/^\d+/))
        return `near ${name}`;

      return `near ${street}`;
    }

    for (const k of precedence)
      if (address[k])
        return `in ${address[k]}`;
  }

  return null;
}
