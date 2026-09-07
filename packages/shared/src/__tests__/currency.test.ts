import { describe, it, expect } from 'vitest';
import { formatINR, parseINR, formatINRInWords } from '../currency';

describe('Indian Currency Formatter (formatINR)', () => {
  it('correctly formats standard Indian numbers with proper grouping', () => {
    expect(formatINR(1000)).toBe('₹1,000');
    expect(formatINR(10000)).toBe('₹10,000');
    expect(formatINR(100000)).toBe('₹1,00,000'); // 1 Lakh
    expect(formatINR(1000000)).toBe('₹10,00,000'); // 10 Lakhs
    expect(formatINR(10000000)).toBe('₹1,00,000,00' === '₹1,00,00,000' ? '₹1,00,00,000' : '₹1,00,00,000'); // 1 Crore
    expect(formatINR(10000000)).toBe('₹1,00,00,000');
    expect(formatINR(12345678)).toBe('₹1,23,45,678');
  });

  it('handles negative numbers properly', () => {
    expect(formatINR(-5000)).toBe('-₹5,000');
    expect(formatINR(-100000)).toBe('-₹1,00,000');
    expect(formatINR(-120000)).toBe('-₹1,20,000');
  });

  it('handles decimals when requested', () => {
    expect(formatINR(1500.5, { showDecimals: true })).toBe('₹1,500.50');
    expect(formatINR(100000.75, { showDecimals: true })).toBe('₹1,00,000.75');
  });

  it('supports compact representation (K, L, Cr)', () => {
    expect(formatINR(50000, { compact: true })).toBe('₹50.0 k');
    expect(formatINR(150000, { compact: true })).toBe('₹1.50 L');
    expect(formatINR(25000000, { compact: true })).toBe('₹2.50 Cr');
  });

  it('handles edge cases gracefully', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(null)).toBe('₹0');
    expect(formatINR(undefined)).toBe('₹0');
    expect(formatINR(NaN)).toBe('₹0');
  });
});

describe('Indian Currency Parser (parseINR)', () => {
  it('parses formatted strings back to numbers', () => {
    expect(parseINR('₹1,00,000')).toBe(100000);
    expect(parseINR('₹ 10,00,000.50')).toBe(1000000.5);
    expect(parseINR('-₹50,000')).toBe(-50000);
    expect(parseINR('1.5L')).toBe(150000);
    expect(parseINR('2Cr')).toBe(20000000);
    expect(parseINR('50k')).toBe(50000);
  });
});

describe('formatINRInWords', () => {
  it('formats large numbers into words correctly', () => {
    expect(formatINRInWords(100000)).toBe('₹1 Lakh');
    expect(formatINRInWords(1500000)).toBe('₹15 Lakhs');
    expect(formatINRInWords(10000000)).toBe('₹1 Crore');
    expect(formatINRInWords(25000000)).toBe('₹2.50 Crores');
  });
});
