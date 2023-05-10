import { describe, expect, test } from 'vitest';
import { wordlist } from '../src/wordlist';

describe('wordlist', () => {
  test('length is 2^16', () => {
    expect(wordlist.length).toBe(2 ** 16);
  });

  test('words are unique', () => {
    const set = new Set(wordlist);
    expect(set.size).toBe(2 ** 16);
  });

  test('words are sorted', () => {
    const original = wordlist.join(' ');
    const sorted = wordlist.slice().sort();
    expect(original).toBe(sorted.join(' '));
  });

  test('words are not too long', () => {
    const longWords = wordlist.filter((word) => word.length > 32);
    expect(longWords.length).toBe(0);
  });

  test('words are alphabetic', () => {
    const nonAlphabeticWords = wordlist.filter((word) => !/^[a-zA-Z]+$/.test(word));
    expect(nonAlphabeticWords.length).toBe(0);
  });

  test('words are not repeated', () => {
    const repeatedWords = wordlist.filter((word, index) => word === wordlist[index - 1]);
    expect(repeatedWords.length).toBe(0);
  });
});
