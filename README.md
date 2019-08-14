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

  This is a young project. We're still figuring out what the pieces are and how
  they'll fit together.

  - React-Native + Expo

  - State Manager (TBD)

  - Database (TBD)

  - Authentication (TBD)

## Setup Instructions

  - Clone this repository

  - Node (10.x or 12.x) -- ensure that you have a recent version installed

  - (iOS) Install [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
    _This may take a while... why not go plogging for an hour?_
    <br>...then launch it at least once so that you can agree to it's Terms and
    Conditions.

  - (Android) Install [Android Studio](https://developer.android.com/studio/) and
  create a virtual device.

    [See here](https://docs.expo.io/versions/v32.0.0/workflow/android-studio-emulator/) for detailed instructions 
    <br>_n.b. Since this app will be deployed on the Google Play Store, 
    when creating a virtual device in the AVD Manager, try to choose a device that 
    has the triangular Google Play Store icon next to it._
    
  - Install `yarn`: https://yarnpkg.com/lang/en/docs/install/

  - Install node modules: `yarn install`
  (NOTE: Do NOT use `npm install` or `npm ci` as packages like 
  react-native-svg-transformer are not managed through npm and this results in 
  conflicting dependencies and there by in errors)

  - Install Expo: `yarn global add expo-cli` (if you prefer NPM Install Expo: sudo 
  npm install expo-cli --global)

  - Configure Firestore connection: rename the file `firebase/config.js.example` 
  to `firebase/config.js`. Replace the values in `firebase/config.js` by copying 
  in the new config info (which you can find pinned in the #plogalong Slack 
  channel).

  - In a terminal window, navigate to the root directory of your local clone of
    this repository. Type `expo start` to launch Metro bundler and Expo's
    browser-based developer tools.

  - While Expo runs, you can type `a` at the terminal to run the app in an
    Android emulator or `i` to run it in the iOS simulator; or you can use
    Expo's local web interface.
   
  - To run Plogalong on an iOS device: 
  <br>1. Connect both your computer and your iOS device with same Wi-Fi. 
  <br>2. In Expo XDE, select Host > LAN
  <br>3. Click the"Share" button in Expo XDE to show a QR Code. Use Camera 
  App in iOS (iOS 11+) or any QR code reader (iOS 9 & 10) to scan the QR Code.
  <br>4. Your QR code reader / Camera App, will ask if you want to launch the 
  App in Expo Client App, select "Yes"
  <br>5. Plogalong should load accordingly

## How to Contribute

  Join us on the Code for Boston Slack. We're in the [#plogalong](https://slack.com/app_redirect?channel=CDQDBALUR "Open in Slack") channel.
