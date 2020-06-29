# Plogalong

  ***Plogalong*** is an app for iOS and Android designed to encourage new and
  existing [ploggers](https://en.wikipedia.org/wiki/Plogging) to record the litter they pick up while walking,
  running, or exercising outdoors.

  This is a project of [Code for Boston](https://www.codeforboston.org). If you would like to get involved
  in helping us develop the app, join us at the next [Hack Night](https://www.meetup.com/Code-for-Boston/), and we can
  help you get started.

  We're in the beginning stages of development, but we have a very detailed
  [Mockup](https://marvelapp.com/96b0bd4/screen/53564903).

## Architectural Overview

  - React-Native + Expo: React Native is built on the same bones as React for
  web, except that instead of building user interfaces from DOM elements, you
  use platform-native views (UIViews on iOS, Views on Android). Expo is a
  managed version of React Native that includes a library of components known to
  be compatible with each other. It adds some tooling that help in the
  development cycle.

  - Redux for managing local state

  - Database - Firebase

  - Authentication - Firebase

## Setup Instructions

  - Clone this repository ([How To Clone A Git Repository](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository))

  - Node (10.x or 12.x) -- ensure that you have a recent version installed - https://nodejs.org/en/download/ **Please use a LTS (even) version**
  
  - Make sure that /usr/local/bin is in your $PATH by opening Terminal and typing in echo $PATH (if it's not, follow directions here: https://opensource.com/article/17/6/set-path-linux)

  - (iOS) Install [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
    _This may take a while... why not go plogging for an hour?_
    <br>...then launch it at least once so that you can agree to its Terms and
    Conditions.


  - (Android) Install [Android Studio](https://developer.android.com/studio/) and
  create a virtual device.

    [See here](https://docs.expo.io/versions/v32.0.0/workflow/android-studio-emulator/) for detailed instructions 
    To create a virtual device from the Android welcome screen, click configure>AVD Manager 
    To edit your virtual device selection from somewhere other than the welcome screen, click on the AVD Manager icon in the
    toolbar on the top right (looks like a phone with a green android alien)
    <br>_n.b. Since this app will be deployed on the Google Play Store, 
    when creating a virtual device in the AVD Manager, try to choose a device that 
    has the triangular Google Play Store icon next to it._
    Download an available system image
    
  - (Optional) Install `yarn`: https://yarnpkg.com/lang/en/docs/install/

  - Install Expo: `npm install expo-cli --global` or `yarn global add expo-cli`
  npm install expo-cli --global)

  - Configure Firestore connection: create a new file in the `firebase/` folder, name it `config.js`.
  Add the proper values to `firebase/config.js` by copying 
  in the new config info (which you can find pinned in the #plogalong Slack 
  channel).
  
  - Install node modules: `npm install` or `yarn install`

  - If you're planning on running this on an Android simulator, you'll have to install the Expo app via the simulated 
  device's Google Play Store. To do so, open Android Studio, open the AVD Manager (icon looks like a phone with a green
  Android alien in the top right toolbar), click the Play button under "Actions" to launch the simulator. You can then open
  the Google Play Store on the simulated device. Now search for the Expo app and install it to the simulated device. You may
  have to launch the simulator from Android Studio each time you want to run the app via Expo.

  - In a terminal window, navigate to the root directory of your local clone of
    this repository. Type `expo start` to launch Metro bundler and Expo's
    browser-based developer tools.

  - While Expo runs, you can type `i` to run the app in the iOS simulator. In order to use the Android emulator, launch 
  the Android Virtual Device emulator via Android studio (described above), then type `a` at the terminal to run the app in
  the
    Android emulator. You can also use Expo's local web interface to launch the app.
    
    If you type 'i' and get an error, run 'sudo xcode-select -s /Applications/Xcode.app'
   
  - To run Plogalong on an iOS device: 
  <br>1. Install Expo on your iOS device from the App Store. 
  <br>2. Connect both your computer and your iOS device with same Wi-Fi. 
  <br>3. In Expo XDE in your browser, select Connection > LAN
  <br>4. Use the Camera App on your iOS (iOS 11+)Device or any QR code reader (iOS 9 & 10) to scan the QR Code.
  <br>5. Your QR code reader / Camera App, will ask if you want to launch the 
  App in Expo Client App, select "Yes"
  <br>6. Plogalong should load accordingly
  
  - To run Plogalong on an Android device: 
  <br>1. Install Expo on your Android device from the Google play store. 
  <br>2. In Expo XDE in your browser, select Connection > Tunnel. Wait for a new link and QR code to generate below the connection options, and then click on the link to copy it to your clipboard.
  <br>3. Open Expo on your Android device. If you are on an emulated Android device, then select Open from Clipboard. Otherwise, select Scan QR Code.
  <br>4. There should be a message saying 'Building JavaScript Bundle as the Application loads.
  <br>5. Boom! You're ready to Plog.
  
## API Keys

### Firebase

#### Using the shared Firebase project

Check on our Slack channel for the shared configuration file. Save it to
`firebase/config.js`.

#### Setting up your own Firebase project

1. Install Firebase CLI: `npm install -g firebase-tools`
2. In the `firebase/project` directory, run `firebase login`. If prompted, log
   in to your Firebase account.
3. Choose the project to use:
   - An existing project: Run `firebase use --add` and follow the prompts. (I
     use the alias `"default"`.)
   - A new project: Run `firebase projects:create` and follow the prompts
4. In `firebase/project/functions` run `npm install`.
5. Deploy with `firebase deploy`. (See `firebase deploy --help` for additional
   options.)
   
**Additional setup:** see the section on SendGrid below.

#### Local Configuration

Some Firebase features require additional configuration in the shared app config
(`app.config.js`). When building, you can optionally specify a
`LOCAL_CONFIG_FILE` environment variable. If given, it should be set to the path
(relative to the working directory) of a JS module that exports a config object.
See `app.config.js` for the keys you can override.

### SendGrid

**What it's for**: this API is used to send certain transactional emails: for
example, user feedback.

#### Get API Key

1. [Create an account](https://sendgrid.com)
2. In the SendGrid dashboard, open [API keys](https://app.sendgrid.com/settings/api_keys)
3. Create a new API key. If you choose to customize the access levels, set "Mail
   Send" to Full Access.
4. Copy the API key
   
##### Sender Authentication

1. Open the [Sender
Authentication](https://app.sendgrid.com/settings/sender_auth) page under
Settings
2. Choose "Authenticate Your Domain" and follow the instructions


#### Configure Firebase
1. In this repo, cd to `firebase/project`
2. Set the email configuration options: 
  ```bash firebase functions:config:set
  plogalong.sendgrid_api_key=SG.xxxxxxx plogalong.admin_email=xxxxxx 
  ``` 

  Replace `SG.xxxxxxx` with the API key you got earlier. The
  `plogalong.admin_email` option determines the email address that will receive
  admin alerts (comment submissions, for instance). It will also be the sender
  email unless you provide a separate `plogalong.sender_email` option. In either
  case, you must complete "Sender Authentication" (above) for the sender domain
  or address.
  
### OpenWeatherMap (optional)

**What it's for**: this API is used to populate the Current Weather box on the
Plog screen

**What to do**: Register for a free account on [Open Weather](https://openweathermap.org/api "Open Weather API"). Copy your key
from the "API Keys" tab and paste it into the `openWeatherMapKey` of your `config.json` file.

## Updating

- After a pull request is merged, it may specify that node_modules will need 
to be deleted. When this is the case, delete the `node_modules` folder on your 
local repo and execute `yarn install` in your terminal.
<br>_n.b. if you are using npm, execute `npm install` instead of `yarn install`_

- The time may come when you will have to update Expo on your simulator. To do 
so on the iOS simulator, execute `expo client:install:ios` in your terminal. If it 
doesn't take on the first try, try once more. If you're still stuck after two 
times, consult an expert.

## Remote Debugging
Debugging Plogalong should be no different than debugging any other React Native project, but below are some useful tools for your convenience.
### Option 1: React-DevTools
If you're already familiar with debugging React web apps via Chrome DevTools, this is pretty similar. The [React Native documentation](https://reactnative.dev/docs/debugging#chrome-developer-tools) points out that "the React Developer Tools Chrome extension does not work with React Native" and offers a standalone version of React Developer Tools for debugging. 
#### Installation
The steps for installation can be found [here](https://reactnative.dev/docs/debugging#react-developer-tools).

### Option 2: React Native Debugger
Similar to React-DevTools is the [React Native Debugger published on GitHub](https://github.com/jhen0409/react-native-debugger) by user jhen0409. This standalone app is based on the DevTools in Option 1 above, but may provide more functionality.
#### Installation
For installation via Homebrew, you can follow the [README instructions](https://github.com/jhen0409/react-native-debugger#installation). 
<br>Otherwise, you can simply download the appropriate prebuild binary from the [release page](https://github.com/jhen0409/react-native-debugger/releases) (choose the .dmg file for macOS and .exe for Windows)
#### Usage
1. Open React Native Debugger app, and notice that the default port is set to 8081. With this default window open, select Debugger > New Window (or more simply ⌘T or Ctrl+T) to change the port to 19001. Confirm the new packager port.
2. Fire up the Plogalong app via `expo start` just like you always do.
3. Navigate to the Expo Developer Menu with a shake gesture (Ctrl ⌘ Z in an iOS Simulator, Cmd+M in an Android Emulator), and select "Debug Remote JS" from the menu that pops up on the device.
4. The React Native Debugger should connect and you'll see console.log() statements print in the console, be able to inspect elements by triggering the Expo Developer Menu (shake gesture > Toggle Element Inspector), and set breakpoints in the Debugger by navigating to Sources > Page > RNDebuggerWorker.js
5. When you're finished, you'll save yourself some trouble the next time you start Plogalong if you remember to "Stop Remote Debugging" via the Expo Developer Menu (shake gesture).

## How to Contribute

  Join us on the Code for Boston Slack. We're in the [#plogalong](https://slack.com/app_redirect?channel=CDQDBALUR "Open in Slack") channel.
