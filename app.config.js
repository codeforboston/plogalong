const path = require('path');
const plist = require('./util/plist');

let localConfig = {};

if (process.env.LOCAL_CONFIG_FILE) {
  localConfig = require(process.env.LOCAL_CONFIG_FILE);
}

let {
  bundleIdentifier,
  googleServicesPlist = path.join(__dirname, "GoogleService-Info.plist"),
  googleServicesJson = path.join(__dirname, "google-services.json"),
  googleReservedClientId,
  uriScheme = "plogalong",
  amazonAffiliateSourceFile = path.join(__dirname, 'assets/other/amazon.html'),
  iosBundleIdentifier = bundleIdentifier,
  androidBundleIdentifier = bundleIdentifier,
  googleMapsAPIKey,
  ...extra
} = localConfig;

const { appDomain = "app.plogalong.com" } = extra;

if (!androidBundleIdentifier || !googleMapsAPIKey) {
  try {
    const googleConfig = require(googleServicesJson);
    androidBundleIdentifier = androidBundleIdentifier || googleConfig.client[0].client_info.android_client_info.package_name;
    googleMapsAPIKey = googleMapsAPIKey || googleConfig.client[0].api_key[0].current_key;
  } catch (_) {
    androidBundleIdentifier = "com.plogalong.plogalong";
  }
}

const fs = require('fs');
if (!googleReservedClientId || !iosBundleIdentifier) {
  try {
    const iosConfig = plist(fs.readFileSync(googleServicesPlist));
    googleReservedClientId = googleReservedClientId || iosConfig['REVERSED_CLIENT_ID'];
    iosBundleIdentifier = iosBundleIdentifier || iosConfig['BUNDLE_ID'];
  } catch (_) {
    googleReservedClientId = "com.googleusercontent.apps.682793596171-a6od8omgskpmfo7pt4q7es3h8sdtvv3n";
  }
}

if (googleServicesPlist && !fs.existsSync(googleServicesPlist))
  googleServicesPlist = undefined;

if (googleServicesJson && !fs.existsSync(googleServicesJson))
  googleServicesJson = undefined;

if (!extra.amazonAffiliateSource && amazonAffiliateSourceFile)
  extra.amazonAffiliateSource = fs.readFileSync(amazonAffiliateSourceFile).toString();

export default ({config}) => {
  return {
    "expo": {
      "name": "Plogalong",
      "slug": "plogalong",
      "privacy": "public",
      "platforms": [
        "ios",
        "android"
      ],
      "version": "1.0.4",
      "orientation": "portrait",
      "icon": "./assets/images/icon.png",
      "splash": {
        "image": "./assets/images/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      },
      "updates": {
        "fallbackToCacheTimeout": 0
      },
      "assetBundlePatterns": [
        "**/*"
      ],
      "ios": {
        "infoPlist": {
          "NSLocationWhenInUseUsageDescription": "We need your location to record where you plog.",
          "NSCameraUsageDescription": "Allows you to save photos of things you pick up while plogging. Sharing your plogs makes photos visible to other users.",
          "NSPhotoLibraryUsageDescription": "Allows you to save photos of things you pick up while plogging. Sharing your plogs makes photos visible to other users."
        },
        "associatedDomains": [`applinks:${appDomain}`],
        "bundleIdentifier": iosBundleIdentifier,
        "supportsTablet": false,
        "config": {
          "googleSignIn": {
            "reservedClientId": googleReservedClientId
          }
        },
        "googleServicesFile": googleServicesPlist,
        "usesAppleSignIn": true
      },
      "android": {
        "package": androidBundleIdentifier,
        "googleServicesFile": googleServicesJson,
        // "softwareKeyboardLayoutMode": "pan",
        "permissions": ["CAMERA", "ACCESS_FINE_LOCATION"],
        "versionCode": 3,
        "intentFilters": [
          {
            "action": "VIEW",
            "autoVerify": true,
            "data": [
              {
                "scheme": "https",
                "host": appDomain,
                "pathPrefix": "/"
              }
            ],
            "category": [
              "BROWSABLE",
              "DEFAULT"
            ]
          }
        ],
        "config": {
          "googleMaps": {
            "apiKey": googleMapsAPIKey
          }
        }
      },
      "packagerOpts": {
        "config": "metro.config.js",
        "sourceExts": ["expo.ts", "expo.tsx", "expo.js", "expo.jsx", "ts", "tsx", "js", "jsx", "json", "wasm", "svg"]
      },
      "scheme": uriScheme,
      "extra": extra
    }
  };
};
