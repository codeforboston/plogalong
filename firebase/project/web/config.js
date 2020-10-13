const cp = require('child_process');

let ipaURL;
try {
  ipaURL = cp.execFileSync('expo', ['url:ipa', '../../..']).toString().trim();
} catch(_) {}

module.exports = {
  ios: {
    appID: "JQXQCN3XB5.com.plogalong.plogalong",
    ipaURL
  },
  android: {
    namespace: 'plogalong',
    package: 'com.plogalong.plogalong',
    certFingerprints: [
      'f4:16:dd:f4:24:30:b8:f5:91:4c:34:44:c4:33:01:38:89:7d:9e:ec:f7:65:c4:10:1c:a2:47:f1:f8:66:9c:03',
      '2f:a5:e2:c8:8a:5d:31:d2:f8:61:d6:bc:3b:da:be:e1:be:c1:e1:69:a6:d4:ea:c6:72:c7:0c:78:5e:64:d4:ae',
    ]
  },
  domain: 'app.plogalong.com',
};
