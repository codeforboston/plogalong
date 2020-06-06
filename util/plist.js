const pair = /<key>(.+?)<\/key>\s+<(string|true|false)>(.*)<\/\2>/ig;

module.exports = function getKVPairs(rawPlist) {
  const pattern = new RegExp(pair);
  const result = {};
  let m;

  while ((m = pattern.exec(rawPlist))) {
    result[m[1]] =
      m[2] === 'true' ? true :
      m[2] === 'false' ? false :
      m[3];
  }

  return result;
};
