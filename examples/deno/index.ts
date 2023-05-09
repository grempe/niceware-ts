import {
  bytesToPassphrase,
  generatePassphrase,
  passphraseToBytes,
} from '../../dist/index.js';

// Generate a passphrase with 16 bytes (128 bits) of entropy
const passphrase = generatePassphrase(16, true);

// Convert the passphrase to a byte array
const bytes = passphraseToBytes(passphrase);

console.log(passphrase); // Output: "deadpanned steamily penuriously geometry elusion trainload camelback inexcusable"
console.log(bytes); // Uint8Array(16) [ 50, 222, 213,  47, 158, 168,  89,  37,  67, 191, 229, 223,  27, 197, 109, 85 ]
console.log(bytesToPassphrase(bytes, true)); // Output: "deadpanned steamily penuriously geometry elusion trainload camelback inexcusable"
