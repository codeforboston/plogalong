const path = require('path');

const fs = require('fs');
const handlebars = require('handlebars');
const { promisify } = require('util');
const walk = require('walk');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const ROOT = process.env.WEB_ROOT ||
      path.normalize(path.join(__dirname, '..', 'public'));
const CONFIG_FILE = process.env.LOCAL_WEB_CONFIG_FILE ?
      path.normalize(path.join(process.env.PWD,
                               process.env.LOCAL_WEB_CONFIG_FILE)) :
      '../config';
const TEMPLATE_PATTERN = /\.template(?=\.|$)/i;

/** @type {(file: walk.WalkStats) => string|null} */
const DefaultMatcher = ({name}) => {
  const m = name.match(TEMPLATE_PATTERN);
  return m && name.slice(0, m.index) + name.slice(m.index + m[0].length);
};

/**
 * @param {(path?: string, outPath?: string, file?: walk.WalkStats) => any} callback
 */
function getTemplates(callback, root=ROOT, match=DefaultMatcher) {
  const walker = walk.walk(root);
  walker.on('file', async (dir, file, next) => {
    const outFile = match(file);
    if (outFile) {
      const result = callback(path.join(dir, file.name),
                              path.join(dir, outFile), file);
      if (result && result.then)
        await result;
    }

    next();
  });
  walker.on('end', () => {
    callback();
  });
}

function processTemplates(options = {}) {
  options = Object.assign({
    root: ROOT,
    match: DefaultMatcher
  }, options);

  const context = require(CONFIG_FILE);

  return new Promise(resolve => {
    getTemplates(async (filepath, outpath) => {
      if (!filepath) {
        resolve();
        return;
      }

      const source = await readFile(filepath);
      const fn = handlebars.compile(source.toString());
      try {
        console.log(filepath, '->', outpath);
        await writeFile(outpath, fn(context));
      } catch (err) {
        console.error(`Processing failed on template`,
                      filepath, err);
        throw err;
      }
    });
  });
}

processTemplates();
