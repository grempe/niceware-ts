import { describe, expect, test } from 'vitest';
import {
  bytesToPassphrase,
  generatePassphrase,
  passphraseToBytes,
  MAX_PASSPHRASE_ENTROPY_BYTES,
} from '../src/index';

describe('generatePassphrase', () => {
  test('returns a passphrase of the correct length', () => {
    expect(generatePassphrase(0).length).toBe(0);
    expect(generatePassphrase(2).length).toBe(1);
    expect(generatePassphrase(20).length).toBe(10);
    expect(generatePassphrase(512).length).toBe(256);
  });

  test('throws an error for odd byte lengths', () => {
    expect(() => generatePassphrase(1)).toThrow(
      'byteLen must be an even number between 0 and 1024',
    );
    expect(() => generatePassphrase(23)).toThrow(
      'byteLen must be an even number between 0 and 1024',
    );
  });

  test('throws an error for invalid byte lengths', () => {
    expect(() => generatePassphrase(-1)).toThrow(
      'byteLen must be an even number between 0 and 1024',
    );
    expect(() => generatePassphrase(1026)).toThrow(
      'byteLen must be an even number between 0 and 1024',
    );
  });
});

describe('bytesToPassphrase', () => {
  test('returns an empty string for an empty byte array', () => {
    expect(bytesToPassphrase(new Uint8Array(0)).length).toBe(0);
  });

  test('converts bytes to a passphrase', () => {
    expect(bytesToPassphrase(new Uint8Array([0x00, 0x00]), true)).toBe('a');
    expect(bytesToPassphrase(new Uint8Array([0xff, 0xff]), true)).toBe('zyzzyva');
    expect(
      bytesToPassphrase(
        new Uint8Array([
          0, 0, 17, 212, 12, 140, 90, 247, 46, 83, 254, 60, 54, 169, 255, 255,
        ]),
        true,
      ),
    ).toBe('a billet baiting glum crawl writhing deplane zyzzyva');
  });

  test('throws an error for odd-length byte arrays', () => {
    expect(() => bytesToPassphrase(new Uint8Array(1))).toThrow(
      'bytes argument must be an even length Uint8Array',
    );
    // @ts-expect-error
    expect(() => bytesToPassphrase([1, 2])).toThrow(
      'bytes argument must be a Uint8Array',
    );
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
    expect(() => passphraseToBytes('a\nb')).toThrow(
      'passphrase words must contain only A-Z, case insensitive, and be no longer than 32 characters',
    );
    // @ts-expect-error
    expect(() => passphraseToBytes(1)).toThrow(
      'passphrase must be an array, or a string with words separated by spaces',
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
