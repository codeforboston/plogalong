import {Address} from 'expo-location';

/** @type {(keyof Address)[]} */
const precedence = ['city', 'region', 'country'];

export function prepareAddress(address) {
   if (address) {
    const {street, name} = address;

    if (street) {
      if (name && !name.match(/^\d+/))
        return { preposition: 'near', name };

      return { preposition: 'near', name: street };
    }

    for (const k of precedence)
      if (address[k])
      return { preposition: 'in', name: address[k] };
  }

  return null;

}

/**
 * @param {Address} address
 */
export function formatAddress(address) {
  const prepared = prepareAddress(address);

  return prepared && `${prepared.preposition} ${prepared.name}`;
}
