import * as ImageManipulator from 'expo-image-manipulator';

import { storage } from './init';
import * as firebase from 'firebase';

const { TaskEvent, TaskState } = firebase.storage;

/**
 * @typedef {object} UploadOptions
 * @property {{ width: number, height: number}} [resize]
 * @property {(snap: firebase.storage.UploadTaskSnapshot) => void} [progress]
 */
/**
 * @param {string} uri
 * @param {string} path
 * @param {UploadOptions} [options]
 *
 * @returns {Promise<string>}
 */
export async function uploadImage(uri, path, options={}) {
  if (options.resize) {
    const modified = await ImageManipulator.manipulateAsync(uri,
                                                            [{ resize: options.resize }],
                                                            { compress: 7 });
    uri = modified.uri;
  }

  const ref = storage.ref().child(path);
  const upload = ref.put(await fetch(uri).then(response => response.blob()));

  if (options.progress)
    upload.on(TaskEvent.STATE_CHANGED, options.progress);

  await upload;

  return await ref.getDownloadURL();
}
