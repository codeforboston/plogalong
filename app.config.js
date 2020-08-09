const plist = require('./util/plist');

let localConfig = {};

if (process.env.LOCAL_CONFIG_FILE) {
  localConfig = require(process.env.LOCAL_CONFIG_FILE);
}

let {
  bundleIdentifier,
  googleServicesPlist = "./GoogleService-Info.plist",
  googleServicesJson = "./google-services.json",
  googleReservedClientId,
  uriScheme = "plogalong",
  amazonAffiliateSourceFile = './assets/other/amazon.html',
  ...extra
} = localConfig;

const { appDomain = "app.plogalong.com" } = extra;

if (!bundleIdentifier) {
  try {
    const googleConfig = require(googleServicesJson);
    bundleIdentifier = googleConfig.client[0].client_info.android_client_info.package_name;
  } catch (_) {
    bundleIdentifier = "com.plogalong.Plogalong";
  }
}

const fs = require('fs');
if (!googleReservedClientId) {
  try {
    const iosConfig = plist(fs.readFileSync(googleServicesPlist));
    googleReservedClientId = iosConfig['REVERSED_CLIENT_ID'];
  } catch (_) {
    googleReservedClientId = "com.googleusercontent.apps.682793596171-i7d7f566bivop6gronrpcc67fqdecg3t";
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
      "version": "1.0.0",
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
          "NSLocationWhenInUseUsageDescription": "ABC"
        },
        "associatedDomains": [`applinks:${appDomain}`],
        "bundleIdentifier": bundleIdentifier,
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
        "package": bundleIdentifier,
        "googleServicesFile": googleServicesJson,
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
        ]
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
