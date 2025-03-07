// In your test file
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}
