import { describe, expect, test } from 'vitest';
import {
  bytesToPassphrase,
  generatePassphrase,
  passphraseToBytes,
  MAX_PASSPHRASE_ENTROPY_BYTES,
} from '../src/index';

describe('generatePassphrase', () => {
  test('returns a passphrase of the correct length', () => {
    // expect(generatePassphrase(0).length).toBe(0);
    expect(generatePassphrase(2).length).toBe(1);
    expect(generatePassphrase(20).length).toBe(10);
    expect(generatePassphrase(512).length).toBe(256);
  });

  test('throws an error for odd byte lengths', () => {
    expect(() => generatePassphrase(1)).toThrow(
      'byteLen must be an even number between 2 and 1024',
    );
    expect(() => generatePassphrase(23)).toThrow(
      'byteLen must be an even number between 2 and 1024',
    );
  });

  test('throws an error for invalid byte lengths', () => {
    expect(() => generatePassphrase(-1)).toThrow(
      'byteLen must be an even number between 2 and 1024',
    );
    expect(() => generatePassphrase(1026)).toThrow(
      'byteLen must be an even number between 2 and 1024',
    );
  });
});

describe('bytesToPassphrase', () => {
  test('returns an empty string for an empty byte array', () => {
    expect(bytesToPassphrase(new Uint8Array(0)).length).toBe(0);
  });

  test('converts even length bytes to a passphrase', () => {
    expect(bytesToPassphrase(new Uint8Array([0x00, 0x00])).join(' ')).toBe('a');
    expect(bytesToPassphrase(new Uint8Array([0xff, 0xff])).join(' ')).toBe('zyzzyva');
    expect(
      bytesToPassphrase(
        new Uint8Array([
          0, 0, 17, 212, 12, 140, 90, 247, 46, 83, 254, 60, 54, 169, 255, 255,
        ]),
      ).join(' '),
    ).toBe('a billet baiting glum crawl writhing deplane zyzzyva');
  });

  test('converts odd length bytes to a padded passphrase', () => {
    expect(bytesToPassphrase(new Uint8Array([0x00, 0x00, 0x00])).join(' ')).toBe(
      'a accompanying pad safely',
    );
    expect(bytesToPassphrase(new Uint8Array([0xff, 0xff, 0xff])).join(' ')).toBe(
      'zyzzyva yoked pad safely',
    );
    expect(
      bytesToPassphrase(
        new Uint8Array([
          0, 0, 17, 212, 12, 140, 90, 247, 46, 83, 254, 60, 54, 169, 255, 255, 128,
        ]),
      ).join(' '),
    ).toBe('a billet baiting glum crawl writhing deplane zyzzyva magnify pad safely');
  });

  test('throws an error for invalid argument', () => {
    // @ts-expect-error
    expect(() => bytesToPassphrase([1, 2])).toThrow(
      'bytes argument must be a Uint8Array',
    );
    // @ts-expect-error
    expect(() => bytesToPassphrase('foo')).toThrow('bytes argument must be a Uint8Array');
  });
});

describe('passphraseToBytes', () => {
  test('converts a passphrase to bytes', () => {
    expect(passphraseToBytes('a')).toEqual(new Uint8Array([0x00, 0x00]));
    expect(passphraseToBytes('zyzzyva')).toEqual(new Uint8Array([0xff, 0xff]));
    expect(
      passphraseToBytes('a billet baiting glum crawl writhing deplane zyzzyva'),
    ).toEqual(
      new Uint8Array([
        0, 0, 17, 212, 12, 140, 90, 247, 46, 83, 254, 60, 54, 169, 255, 255,
      ]),
    );
  });

  test('converts a padded passphrase back to original odd length number of bytes', () => {
    expect(passphraseToBytes('a accompanying pad safely')).toEqual(
      new Uint8Array([0x00, 0x00, 0x00]),
    );
    expect(passphraseToBytes('zyzzyva yoked pad safely')).toEqual(
      new Uint8Array([0xff, 0xff, 0xff]),
    );
    expect(
      passphraseToBytes(
        'a billet baiting glum crawl writhing deplane zyzzyva magnify pad safely',
      ),
    ).toEqual(
      new Uint8Array([
        0, 0, 17, 212, 12, 140, 90, 247, 46, 83, 254, 60, 54, 169, 255, 255, 128,
      ]),
    );
  });

  test('converts a passphrase to bytes with improper spacing, newlines, tabs, etc', () => {
    // ok
    expect(passphraseToBytes('a billet baiting glum')).toEqual(
      new Uint8Array([0, 0, 17, 212, 12, 140, 90, 247]),
    );
    // internal spaces
    expect(passphraseToBytes('a    billet    baiting    glum')).toEqual(
      new Uint8Array([0, 0, 17, 212, 12, 140, 90, 247]),
    );
    // leading/trailing spaces
    expect(passphraseToBytes(' a billet baiting glum ')).toEqual(
      new Uint8Array([0, 0, 17, 212, 12, 140, 90, 247]),
    );
    // newlines
    expect(passphraseToBytes('a\nbillet\nbaiting\nglum')).toEqual(
      new Uint8Array([0, 0, 17, 212, 12, 140, 90, 247]),
    );
    // tabs
    expect(passphraseToBytes('a\tbillet\tbaiting\tglum')).toEqual(
      new Uint8Array([0, 0, 17, 212, 12, 140, 90, 247]),
    );
  });

  test('converts a max length passphrase to bytes', () => {
    const passphrase = generatePassphrase(512);
    expect(passphraseToBytes(passphrase).length).toEqual(512);
  });

  test('throws an error for invalid passphrases', () => {
    expect(() => passphraseToBytes('')).toThrow(
      'passphrase words must contain only A-Z, case insensitive, and be no longer than 32 characters',
    );
    expect(() => passphraseToBytes(' ')).toThrow(
      'passphrase words must contain only A-Z, case insensitive, and be no longer than 32 characters',
    );
    // expect(() => passphraseToBytes('a\nb')).toThrow(
    //   'passphrase words must contain only A-Z, case insensitive, and be no longer than 32 characters',
    // );
    // @ts-expect-error
    expect(() => passphraseToBytes(1)).toThrow(
      'passphrase must be an array, or a string with words delimited by spaces',
    );
    expect(() => passphraseToBytes([])).toThrow('passphrase must have at least one word');
    // @ts-expect-error
    expect(() => passphraseToBytes([1, 2, 3])).toThrow(
      'passphrase must be an array of strings',
    );
    expect(() => passphraseToBytes('apple')).toThrow(
      'passphrase has an invalid word: apple',
    );
    expect(() => {
      passphraseToBytes(new Array(513).fill('a').join(' '));
    }).toThrow(`passphrase must be no longer than 512 words`);
  });
});

describe('roundTrip', () => {
  test('converts a passphrase to bytes and back 10,000 times', () => {
    for (let i = 0; i < 10_000; i++) {
      // This generates a random number between 0 (inclusive) and 1 (exclusive)
      // using Math.random(), multiplies it by 16 to get a random number between
      // 0 (inclusive) and 16 (exclusive), adds 1 to shift the range to 1 (inclusive)
      // to 17 (exclusive), rounds it down to the nearest integer using Math.floor(),
      // and then multiplies it by 2 to get a random even number between 2 and 64.
      // The resulting randomEvenNumber variable will be a random even integer
      // between 2 and 64.
      const randomEvenNumber = Math.floor(Math.random() * 16 + 1) * 2;

      const passphrase = generatePassphrase(randomEvenNumber);
      // console.log(Array.isArray(passphrase) ? passphrase.join(' ') : passphrase);
      expect(passphraseToBytes(passphrase)).toEqual(
        passphraseToBytes(bytesToPassphrase(passphraseToBytes(passphrase))),
      );
    }
  });
});
