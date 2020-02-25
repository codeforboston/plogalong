import * as ImageManipulator from 'expo-image-manipulator';

import { storage } from './init';

/**
 * @param {string} uri
 * @param {string} path
 * @param {{ resize: { width: number, height: number} }} [options]
 */
export async function uploadImage(uri, path, options={}) {
  if (options.resize) {
    const modified = await ImageManipulator.manipulateAsync(uri,
                                                            [{ resize: options.resize }],
                                                            { compress: 7 });
    uri = modified.uri;
  }

  const ref = storage.ref().child(path);
  await ref.put(await fetch(uri).then(response => response.blob()));
  return await ref.getDownloadURL();
}
