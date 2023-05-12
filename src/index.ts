import { randomBytes } from '@stablelib/random';

import { wordlist } from './wordlist';

export const MIN_PASSPHRASE_ENTROPY_BYTES = 2;
export const MAX_PASSPHRASE_ENTROPY_BYTES = 1024;
export const WORDLIST = wordlist;

/**
 * A Uint8Array of 5 bytes that serves as the marker to indicate that an array
 * has been padded to an even length. The values were carefully chosen to be unlikely to
 * occur in a random array and will also always add one new random word and
 * the words "pad safely" to the tail end of passphrase.
 */
const PAD_MARKER = new Uint8Array([0x128, 0x9a, 0x6d, 0xc0, 0x6b]);

/**
 * Pads a Uint8Array to an even length by appending the PAD_MARKER if the array
 * length is odd.
 *
 * @param {Uint8Array} arr - The Uint8Array to pad.
 * @returns The padded Uint8Array.
 */
function padUint8ArrayToEvenLength(arr: Uint8Array): Uint8Array {
  if (arr.length % 2 === 1) {
    const paddedArr = new Uint8Array(arr.length + PAD_MARKER.length);
    paddedArr.set(arr);
    paddedArr.set(PAD_MARKER, arr.length);
    return paddedArr;
  } else {
    return arr;
  }
}

/**
 * Removes the PAD_MARKER from a padded Uint8Array, if present, to return the
 * original unpadded Uint8Array.
 *
 * @param {Uint8Array} paddedArr - The potentially padded Uint8Array to unpad.
 * @returns The original array if no padding marker is found, otherwise the unpadded Uint8Array.
 */
function unpadUint8ArrayFromEvenLength(paddedArr: Uint8Array): Uint8Array {
  const marker = paddedArr.slice(paddedArr.length - PAD_MARKER.length);
  if (marker.every((value, index) => value === PAD_MARKER[index])) {
    return paddedArr.slice(0, paddedArr.length - PAD_MARKER.length);
  } else {
    return paddedArr;
  }
}

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
 * @returns {string[]} The passphrase as an array of words.
 * @throws {Error} If the bytes argument is not a Uint8Array.
 * @throws {Error} If the word index calculated from the byte array is invalid.
 */
export function bytesToPassphrase(bytes: Uint8Array): string[] {
  if (!(bytes instanceof Uint8Array)) {
    throw new Error('bytes argument must be a Uint8Array');
  }

  const paddedBytes = padUint8ArrayToEvenLength(bytes);

  // The following code is responsible for converting each byte in the byte
  // array to a word index and adding the corresponding word to the passphrase.
  // The byte * 256 + next expression calculates the word index from the current
  // byte and the next byte in the byte array. The wordlist[wordIndex]
  // expression retrieves the word corresponding to the calculated word index
  // from the wordlist array.
  const passphrase: string[] = [];
  for (const entry of paddedBytes.entries()) {
    const [index, byte] = entry;
    const next = paddedBytes[index + 1];

    if (index % 2 === 0) {
      const wordIndex = byte * 256 + next; // max value is 255 * 256 + 255 = 65535
      const word = wordlist[wordIndex];
      passphrase.push(word);
    }
  }

  return passphrase;
}

/**
 * Generates a random passphrase with the specified underlying byte length.
 * @param {number} byteLen The number of random bytes to generate. Must be an even number between 2 and 1024.
 * @returns {string[]} A passphrase as an array of words.
 * @throws {Error} If the byteLen argument is not a valid even number between 2 and 1024.
 */
export function generatePassphrase(byteLen: number): string[] {
  if (
    typeof byteLen !== 'number' ||
    byteLen < MIN_PASSPHRASE_ENTROPY_BYTES ||
    byteLen > MAX_PASSPHRASE_ENTROPY_BYTES ||
    byteLen % 2 === 1
  ) {
    throw new Error(
      `byteLen must be an even number between ${MIN_PASSPHRASE_ENTROPY_BYTES} and ${MAX_PASSPHRASE_ENTROPY_BYTES}`,
    );
  }

  return bytesToPassphrase(randomBytes(byteLen));
}

/**
 * Convert a passphrase into a Uint8Array.
 * @param {string | string[]} passphrase The passphrase to convert to bytes as a space delimited string or Array.
 * @returns {Uint8Array} The byte representation of the passphrase.
 * @throws {Error} If the passphrase argument is not a string or an array of strings.
 * @throws {Error} If a word in the passphrase is not found in the wordlist.
 */
export function passphraseToBytes(passphrase: string | string[]): Uint8Array {
  // If the passphrase is a space delimited string, split it into an array
  if (typeof passphrase === 'string') {
    passphrase = passphrase
      .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
      .trim() // Trim leading and trailing spaces
      .replace(/[^a-zA-Z ]/g, '') // Remove non-alphabetic characters except spaces;
      .split(' '); // Split on spaces
  }

  // Test that the passphrase argument is an Array
  if (!Array.isArray(passphrase)) {
    throw new Error(
      'passphrase must be an array, or a string with words delimited by spaces',
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

  const unpaddedBytes = unpadUint8ArrayFromEvenLength(bytes);

  return unpaddedBytes;
}
