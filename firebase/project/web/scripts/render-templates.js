const path = require('path');

const fs = require('fs');
const handlebars = require('handlebars');
const { promisify } = require('util');
const walk = require('walk');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);


const ROOT = process.env.WEB_ROOT ||
      path.normalize(path.join(__dirname, '..', 'public'));
const { GCLOUD_PROJECT: PROJECT_ID, LOCAL_WEB_CONFIG_FILE, PWD, INIT_CWD } = process.env;
const PROJECT_CONFIG_FILE = `../${PROJECT_ID}.config`;
const CONFIG_FILE = LOCAL_WEB_CONFIG_FILE ?
      path.normalize(path.join(INIT_CWD || PWD, LOCAL_WEB_CONFIG_FILE)) :
      '../config';
const TEMPLATE_PATTERN = /\.template(?=\.|$)/i;
const PARTIALS_DIR = path.normalize(path.join(__dirname, '..', 'partials'));

/** @type {(file: walk.WalkStats) => string|null} */
const DefaultMatcher = ({name}) => {
  const m = name.match(TEMPLATE_PATTERN);
  return m && name.slice(0, m.index) + name.slice(m.index + m[0].length);
};

handlebars.registerHelper('stringify', any => JSON.stringify(any));

/**
 * @param {typeof handlebars} Handlebars
 */
function registerPartials(Handlebars, partialsDir=PARTIALS_DIR) {
  return new Promise(resolve => {
    const walker = walk.walk(partialsDir);
    walker.on('file', async (dir, file, next) => {
      const fullPath = path.join(dir, file.name);
      const templateName = path.join(path.relative(partialsDir, dir),
                                     file.name.split(/\.([^.]+)$/)[0]);
      const source = await readFile(fullPath);

      Handlebars.registerPartial(templateName, source.toString());

      next();
    });
    walker.on('end', () => {
      resolve();
    });
  });
}

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

function loadContext() {
  const context = require(CONFIG_FILE);
  try {
    Object.assign(context, require(PROJECT_CONFIG_FILE));
  } catch (_) {}
  return context;
}

async function cleanup() {
  await new Promise(resolve => {
    getTemplates(async (filepath, outpath) => {
      if (!filepath) {
        resolve();
        return;
      }

      try {
        await unlink(outpath);
      } catch (err) {
        if (err.code !== 'ENOENT')
          console.warn('error deleting', outpath, err);
      }
    });
  });
}

async function processTemplates() {
  const context = loadContext();
  await registerPartials(handlebars);

  await new Promise(resolve => {
    getTemplates(async (filepath, outpath) => {
      if (!filepath) {
        resolve();
        return;
      }

      if (await exists(outpath)) {
        const webDirRelative = path.relative(INIT_CWD || PWD, path.join(__dirname, '..'));
        console.error(
          `There is already a file at "${outpath}". Please delete it or run ` +
          `"npm${webDirRelative && (' --prefix ' + webDirRelative)} run cleanup-templates".\n` +
          `If you'd like to change the file, edit the template ` +
          `instead (${filepath}).`
        );
        return;
      }

      const source = await readFile(filepath);
      const fn = handlebars.compile(source.toString());
      try {
        const urlPath = path.relative(ROOT, outpath);
        await writeFile(outpath, fn({ ...context, path: urlPath }));
      } catch (err) {
        console.error(`Processing failed on template`,
                      filepath, err);
        throw err;
      }
    });
  });
}

async function run(args) {
  const [command] = args;

  if (!command || command === 'render')
    processTemplates();
  else if (command === 'cleanup')
    cleanup();
}

if (require.main === module) {
  run(process.argv.slice(2))
    .catch(err => {
      process.exit(1);
    });
}
