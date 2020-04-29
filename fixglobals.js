if (!global.btoa) {
  const base64 = require('base-64');
  global.btoa = base64.encode;
  global.atob = base64.decode;
}
