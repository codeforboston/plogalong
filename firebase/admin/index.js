#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Duplex, Readable, Writable } = require('stream');
const repl = require('repl');
const EventEmitter = require('events');

const blessed = require('blessed');
const yargs = require('yargs');

const credsFile = path.join(__dirname, 'app-credentials.json');

if (!fs.existsSync(credsFile))
  throw 'No credentials file found';

process.env.GOOGLE_APPLICATION_CREDENTIALS = credsFile;

const app = require('./app');
const users = require('./users');


function presentResults(results) {
  screen = blessed.screen({
    smartCSR: true
  });
  screen.title = 'Results';
  const box = blessed.box({
    top: 0,
    width: '100%',
    content: 'Hi',
    align: 'center'
  });
  screen.append(box);
  const table = blessed.table({
    top: 2,
    bottom: 2,
    data: results.map(result => ([result.uid, result.email])),
    scrollable: true
  });
  screen.key(['space', 'C-d', 'enter'], (ch, key) => {
    const amount = ch === ' ' ? table.getScrollHeight() :
          key.full === 'C-d' ? table.getScrollHeight()/2 :
          1;
    table.scroll(amount);
  });
  screen.append(table);
  table.focus();
  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });
  screen.render();
}

const nextEvent = (source, event) => (
  new Promise(resolve => {
    source.once(event, resolve);
  })
);

class ReadableEvents extends Readable {
  constructor(emitter, options) {
    super(options);

    emitter.on('input', input => {
      this.push(input);
    });
  }
}

async function startRepl() {
  const screen = blessed.screen({
    smartCSR: true
  });
  screen.title = 'Results';
  const titleBar = blessed.box({
    top: 0,
    width: '100%',
    content: 'Hi',
    align: 'center'
  });
  screen.append(titleBar);
  const text = blessed.text({
    top: 2,
    bottom: 2,
    width: '100%',
    scrollable: true,
    align: 'left',
    style: {
      fg: 'white'
    }
  });
  screen.append(text);

  screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
  });

  const input = blessed.textbox({
    bottom: 0,
    height: 4,
    width: '100%',
    border: 'line',
    style: {
      fg: 'white'
    }
  });
  input.on('focus', readLoop);

  const context = {
    Plogs: app.firestore().collection('plogs'),
    Users: app.firestore().collection('users'),
  };

  const emitter = new EventEmitter();

  // const inputStream = new ReadableEvents(emitter);
  const inputStream = process.stdin;
  const outputStream = new Writable({
    write(chunk, _, next) {
      emitter.emit('output', chunk.toString());
      next();
    }
  });
  const server = repl.start({
    input: inputStream,
    output: outputStream,
    prompt: '',
    // eval(x) {
    //   console.log(`eval>> ${x}`);
    //   console.log(input);
    // }
  });

  input.key(['C-c'], (ch, key) => {
    return process.exit(0);
  });

  function readLoop() {
    input.readInput(async (_, value) => {
      // emitter.emit('input', value + '\n');
      input.setText('');
      input.clearValue();
      screen.render();
      readLoop();
    });
  }
  screen.append(input);
  input.focus();

  emitter.on('output', output => {
    text.pushLine(output);
    screen.render();
  });

  screen.render();
}

async function startSimpleRepl() {
  const firestore = app.firestore();
  const storage = app.storage();

  const server = repl.start({});
  const defaultEval = server.eval;
  server.eval = (command, context, filename, callback) => {
    const result = defaultEval(command, context, filename, (error, result) => {
      if (error)
        throw error;

      if (result && result.then)
        result.then(result => callback(null, result),
                    error => callback(error));
      else
        callback(null, result);
    });
  };
  Object.assign(server.context, {
    app,
    firestore,
    storage,
    Users: firestore.collection('users'),
    Plogs: firestore.collection('plogs'),
  });
}

async function run(args=process.argv.slice(2)) {
  const inactive = await users.getInactiveUsers();
  // presentResults(inactive);
  // startRepl();
  startSimpleRepl();

  // process.exit(0);
}

run();
