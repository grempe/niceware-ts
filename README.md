# Niceware-TS

Niceware-TS is a TypeScript implementation of
[Niceware](https://github.com/diracdeltas/niceware), a method for generating or
converting random bytes into English language passphrases. This library provides
functions for generating random passphrases with a specified number of bytes of
entropy, as well as converting passphrases to and from byte arrays.

Each word in the passphrase provides 16 bits of entropy, so a secure passphrase
should consist of at least 3 words. With a wordlist containing `2^16` (`65,536`)
words, [Niceware](https://github.com/diracdeltas/niceware) is suitable for
converting cryptographic keys. For example, a key with 128 bits of entropy is
equivalent to an 8 word passphrase.

Niceware can be used for a variety of purposes, including generating secure and
easy-to-remember passphrases and displaying cryptographic key material in a
user-friendly way. A passphrase consisting of 3-5 Niceware words provides 64
bits of randomness, making it a strong password for most online services.
Additionally, an 8-word Niceware phrase can be used to reconstruct an entire
public/private key pair for cryptographic purposes, such as generating a 256-bit
ECC key (equivalent to a 3072-bit RSA key).

Web Demo: <https://diracdeltas.github.io/niceware/>

## Features

- Generate random passphrases with a specified number of bytes of entropy
- Convert passphrases to and from byte arrays
- TypeScript implementation for type safety and ease of use
- Small and lightweight library with no external dependencies

## Improvements

- Encode/Decode passphrases as an Array or words, or a space-delimited string or
  words
- Exports ESM, CommonJS, and TypeScript declaration files
- [Deno](https://deno.land) compatible
- New runtime safety checks with improved error messaging
- New wordlist sanity tests
- Benchmark tests

## Usage

To use Niceware-TS in your TypeScript/ESM/CommonJS project, simply install it
from npm:

```sh
npm install niceware-ts
```

Then, import the functions you need from the module:

```typescript
import {
  bytesToPassphrase,
  generatePassphrase,
  passphraseToBytes,
} from "niceware-ts";

// Generate a passphrase with 16 bytes (128 bits) of entropy
const passphrase = generatePassphrase(16, true);

// Convert the passphrase to a byte array
const bytes = passphraseToBytes(passphrase);

console.log(passphrase); // Output: "deadpanned steamily penuriously geometry elusion trainload camelback inexcusable"
console.log(bytes); // Uint8Array(16) [ 50, 222, 213,  47, 158, 168,  89,  37,  67, 191, 229, 223,  27, 197, 109, 85 ]
console.log(bytesToPassphrase(bytes, true)); // Output: "deadpanned steamily penuriously geometry elusion trainload camelback inexcusable"
```

## License

Niceware-TS is licensed under the MIT License. See
[LICENSE](https://github.com/grempe/niceware-ts/blob/main/LICENSE) for more
information.

## Credits

Many thanks to Yan for creating
[Niceware](https://github.com/diracdeltas/niceware).
