import { describe, expect, bench } from 'vitest';
import { bytesToPassphrase, generatePassphrase, passphraseToBytes } from '../src/index';

describe('benchmark', () => {
  bench('generatePassphrase', () => {
    generatePassphrase(32);
  });

  bench('passphraseToBytes', () => {
    passphraseToBytes([
      'dyewood',
      'quatre',
      'stoutest',
      'dosed',
      'querying',
      'basketry',
      'ambushment',
      'equalling',
      'polenta',
      'overpayment',
      'inapt',
      'clay',
      'harboring',
      'weariest',
      'purveyed',
      'nonfulfillment',
    ]);
  });

  bench('bytesToPassphrase', () => {
    bytesToPassphrase(
      new Uint8Array([
        65, 87, 174, 214, 214, 199, 62, 136, 175, 4, 14, 27, 4, 76, 71, 107, 164, 220,
        153, 35, 107, 76, 35, 171, 96, 187, 249, 128, 173, 211, 144, 224,
      ]),
    );
  });

  bench('round-trip', () => {
    const passphrase = generatePassphrase(32);
    const bytes = passphraseToBytes(passphrase);
    const passphrase2 = bytesToPassphrase(bytes);
    expect(passphrase).toStrictEqual(passphrase2);
  })
});
