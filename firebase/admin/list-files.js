const app = require('./app');

const storage = require('@google-cloud/storage');


/**
 * @param {(file: storage.File) => any} fn
 * @param {(error: any, file?: storage.File) => void} [errFn]
 */
function forEachFile(fn, errFn) {
  return new Promise(resolve => {
    const stream = app.storage().bucket().getFilesStream();

    const pending = new Set();
    let ended = false;
    stream.on('error', err => {
      if (errFn) errFn(err);
      else console.error(err);
    });
    stream.on('data', async file => {

      pending.add(file.name);
      try {
        const result = fn(file);
        if (result.then)
          await result;
      } catch (err) {
        if (errFn) errFn(err, file);
        else stream.end();
      } finally {
        pending.delete(file.name);
        if (!pending.size && ended)
          resolve();
      }
    });
    stream.on('end', () => {
      ended = true;
      if (!pending.size)
        resolve();
    });
  });
}

async function listFiles() {
  const allFiles = [];
  await forEachFile(async file => {
    const [meta] = await file.getMetadata();
    allFiles.push({
      name: file.name,
      size: parseInt(meta.size)
    });
  }, console.error);

  allFiles.sort((a, b) => (b.size - a.size));
  allFiles.slice(0, 20).forEach(f => {
    console.log(`${f.size}`.padEnd(20) + f.name);
  });
}

listFiles();
