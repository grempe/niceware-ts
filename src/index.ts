import { randomBytes } from '@stablelib/random';

import { wordlist } from './wordlist';

export const MAX_PASSPHRASE_ENTROPY_BYTES = 1024;

/**
 * Performs a binary search on the wordlist to find the index of the target word.
 * @param {string[]} arr The wordlist to search.
 * @param {string} target The word to search for.
 * @param {number} start The index to start the search at.
 * @returns {number} The index of the target word, or -1 if not found.
 */
function binarySearch(arr: string[], target: string, start: number): number {
  let low = start;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (target < arr[mid]) {
      high = mid - 1;
    } else if (target > arr[mid]) {
      low = mid + 1;
    } else {
      return mid;
    }
  }

  return -1;
}

/**
 * Convert a Uint8Array into a passphrase.
 * @param {Uint8Array} bytes The bytes to convert to a passphrase.
 * @param {boolean} toString Whether to return the passphrase as a string or an array of words.
 * @returns {string | string[]} The passphrase as either a string or an array of words.
 * @throws {Error} If the bytes argument is not a Uint8Array or has an odd length.
 * @throws {Error} If the word index calculated from the byte array is invalid.
 */
export function bytesToPassphrase(
  bytes: Uint8Array,
  toString?: boolean,
): string | string[] {
  if (!(bytes instanceof Uint8Array)) {
    throw new Error('bytes argument must be a Uint8Array');
  }

  if (bytes.length % 2 === 1) {
    throw new Error('bytes argument must be an even length Uint8Array');
  }

  // The following code is responsible for converting each byte in the byte
  // array to a word index and adding the corresponding word to the passphrase.
  // The byte * 256 + next expression calculates the word index from the current
  // byte and the next byte in the byte array. The wordlist[wordIndex]
  // expression retrieves the word corresponding to the calculated word index
  // from the wordlist array.
  const passphrase: string[] = [];
  for (const entry of bytes.entries()) {
    const [index, byte] = entry;
    const next = bytes[index + 1];

    if (index % 2 === 0) {
      const wordIndex = byte * 256 + next; // max value is 255 * 256 + 255 = 65535
      const word = wordlist[wordIndex];
      passphrase.push(word);
    }
  }

  return toString ? passphrase.join(' ') : passphrase;
}

/**
 * Generates a random passphrase with the specified underlying byte length.
 * @param {number} byteLen The number of random bytes to generate. Must be an even number between 0 and 1024.
 * @param {boolean} toString If true, returns the passphrase as a string of space separated words. Otherwise, returns an array of words.
 * @returns {string | string[]} A passphrase as an array of words or a string of space separated words.
 * @throws {Error} If the byteLen argument is not a valid even number between 0 and 1024.
 */
export function generatePassphrase(
  byteLen: number,
  toString?: boolean,
): string | string[] {
  if (
    typeof byteLen !== 'number' ||
    byteLen < 0 ||
    byteLen > MAX_PASSPHRASE_ENTROPY_BYTES ||
    byteLen % 2 === 1
  ) {
    throw new Error(
      `byteLen must be an even number between 0 and ${MAX_PASSPHRASE_ENTROPY_BYTES}`,
    );
  }

  return bytesToPassphrase(randomBytes(byteLen), toString);
}

/**
 * Convert a passphrase into a Uint8Array.
 * @param {string | string[]} passphrase The passphrase to convert to bytes.
 * @returns {Uint8Array} The byte representation of the passphrase.
 * @throws {Error} If the passphrase argument is not a string or an array of strings.
 * @throws {Error} If a word in the passphrase is not found in the wordlist.
 */
export function passphraseToBytes(passphrase: string | string[]): Uint8Array {
  // If the passphrase is a space delimited string, split it into an array
  if (typeof passphrase === 'string') {
    passphrase = passphrase.split(' ');
  }

  // Test that the passphrase argument is an Array
  if (!Array.isArray(passphrase)) {
    throw new Error(
      'passphrase must be an array, or a string with words separated by spaces',
    );
  }

  if (passphrase.length === 0) {
    throw new Error('passphrase must have at least one word');
  }

  if (!passphrase.every((word) => typeof word === 'string')) {
    throw new Error('passphrase must be an array of strings');
  }

  if (!passphrase.every((word) => /^[a-zA-Z]{1,32}$/.test(word))) {
    throw new Error(
      'passphrase words must contain only A-Z, case insensitive, and be no longer than 32 characters',
    );
  }

  if (passphrase.length > MAX_PASSPHRASE_ENTROPY_BYTES / 2) {
    throw new Error(
      `passphrase must be no longer than ${MAX_PASSPHRASE_ENTROPY_BYTES / 2} words`,
    );
  }

  const bytes = new Uint8Array(passphrase.length * 2);

  // Responsible for filling the byte array with the index of each word in the wordlist array.
  // The wordIndex variable represents the index of the current word in the wordlist array.
  // The Math.floor(wordIndex / 256) expression calculates the first byte of the current word
  // index and stores it in the even index of the byte array. The wordIndex % 256 expression
  // calculates the second byte of the current word index and stores it in the odd index of the byte array.
  passphrase.forEach((word, index) => {
    const wordIndex = binarySearch(wordlist, word.toLowerCase(), 0);

    if (wordIndex < 0) {
      throw new Error(`passphrase has an invalid word: ${word}`);
    }

    bytes[2 * index] = Math.floor(wordIndex / 256);
    bytes[2 * index + 1] = wordIndex % 256;
  });

  return bytes;
}
