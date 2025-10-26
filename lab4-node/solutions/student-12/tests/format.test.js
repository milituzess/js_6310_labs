import { formatPrice, formatDate } from '../src/utils/format.js';
import { describe, test, expect } from '@jest/globals';

describe('Format utilities', () => {
  test('formatPrice formats correctly', () => {
    expect(formatPrice(35000)).toBe('35 000₽');
    expect(formatPrice(1000)).toBe('1 000₽');
    expect(formatPrice(1000000)).toBe('1 000 000₽');
    expect(formatPrice(1)).toBe('1₽');
    expect(formatPrice('35000')).toBe('35000₽');
    expect(formatPrice('')).toBe('???');
    expect(formatPrice(' ')).toBe('???');
    expect(formatPrice('abc')).toBe('???');
    expect(formatPrice(undefined)).toBe('???');
    expect(formatPrice(null)).toBe('???');
    expect(formatPrice(-35000)).toBe('???');
  });

  test('formatDate formats correctly', () => {
    expect(formatDate('2024-06-15')).toBe('15.06.2024');
    expect(formatDate('2024 06 15')).toBe('15.06.2024');
    expect(formatDate('2024/06/15')).toBe('15.06.2024');
    expect(formatDate('')).toBe('???');
    expect(formatDate(' ')).toBe('???');
    expect(formatDate('abc')).toBe('???');
    expect(formatDate(undefined)).toBe('???');
    expect(formatDate(null)).toBe('???');
  });
});
