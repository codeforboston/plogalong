const fs = require('fs');
const path = require('path');

const chalk = require('chalk');


const configLocation = path.resolve(__dirname, '..', 'config.json');
const firebaseConfigLocation = path.resolve(__dirname, '../firebase', 'config.js');

const firebaseExampleConfigLocation = path.resolve(__dirname, '../firebase', 'config.example.js');

function postInstall() {
    if (!fs.existsSync(configLocation)) {
        console.warn(chalk.yellow(`CREATING DEFAULT CONFIG FILE: ${configLocation}`));
        fs.writeFileSync(configLocation, '{}');
    }

    if (!fs.existsSync(firebaseConfigLocation)) {
        console.error(chalk.red(`!!! YOUR FIREBASE CONFIG FILE IS MISSING!\n`) +
                      chalk.yellow(`If you want to use your own config:\n` +
                                   `  1. Copy ${firebaseExampleConfigLocation} -> ${firebaseConfigLocation}\n` +
                                   `  2. Open the file and fill in the appropriate values\n\n` +
                                   `To use the shared config, check our Slack channel.`));
    }
}

function main() {
    postInstall();
}

if (require.main === module)
    main();
