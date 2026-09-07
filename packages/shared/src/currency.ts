/**
 * Formats a number according to the Indian Numbering System:
 * E.g.
 * 1000 -> ₹1,000
 * 10000 -> ₹10,000
 * 100000 -> ₹1,00,000
 * 1000000 -> ₹10,00,000
 * 10000000 -> ₹1,00,00,000
 */
export function formatINR(
  amount: number | string | null | undefined,
  options?: {
    showSymbol?: boolean;
    showDecimals?: boolean;
    compact?: boolean;
  }
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return options?.showSymbol !== false ? '₹0' : '0';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const symbol = options?.showSymbol !== false ? '₹' : '';

  if (options?.compact) {
    if (absNum >= 10000000) {
      // Crores
      const cr = absNum / 10000000;
      return `${isNegative ? '-' : ''}${symbol}${cr.toFixed(cr >= 10 ? 1 : 2)} Cr`;
    }
    if (absNum >= 100000) {
      // Lakhs
      const l = absNum / 100000;
      return `${isNegative ? '-' : ''}${symbol}${l.toFixed(l >= 10 ? 1 : 2)} L`;
    }
    if (absNum >= 1000) {
      // Thousands
      const k = absNum / 1000;
      return `${isNegative ? '-' : ''}${symbol}${k.toFixed(k >= 10 ? 1 : 1)} k`;
    }
    return `${isNegative ? '-' : ''}${symbol}${absNum.toFixed(0)}`;
  }

  const [integerPart, decimalPart] = absNum.toFixed(options?.showDecimals ? 2 : 0).split('.');

  // Format integer part using Indian grouping
  let formattedInteger = '';
  if (integerPart.length <= 3) {
    formattedInteger = integerPart;
  } else {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const remaining = integerPart.substring(0, integerPart.length - 3);
    
    // Group the remaining in pairs of 2 from right to left
    const paired = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formattedInteger = `${paired},${lastThree}`;
  }

  const result = options?.showDecimals && decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  return `${isNegative ? '-' : ''}${symbol}${result}`;
}

/**
 * Parses an INR string back to a numeric float
 * Handles strings like "₹ 1,00,000", "1,50,000.50", "-₹5,000", "1.5L", "2Cr"
 */
export function parseINR(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return 0;

  const trimmed = value.trim().toUpperCase();
  const isNegative = trimmed.startsWith('-') || trimmed.includes('DR') || trimmed.includes('DEBIT');

  // Handle compact suffixes
  if (trimmed.endsWith('CR') || trimmed.endsWith('CRORE') || trimmed.endsWith('CRORES')) {
    const num = parseFloat(trimmed.replace(/[^\d.]/g, ''));
    return (isNegative ? -1 : 1) * (num * 10000000);
  }

  if (trimmed.endsWith('L') || trimmed.endsWith('LAKH') || trimmed.endsWith('LAKHS')) {
    const num = parseFloat(trimmed.replace(/[^\d.]/g, ''));
    return (isNegative ? -1 : 1) * (num * 100000);
  }

  if (trimmed.endsWith('K')) {
    const num = parseFloat(trimmed.replace(/[^\d.]/g, ''));
    return (isNegative ? -1 : 1) * (num * 1000);
  }

  // Remove symbol, commas, spaces
  const cleanStr = trimmed.replace(/[₹,\s]/g, '').replace(/^-/, '');
  const parsed = parseFloat(cleanStr);

  if (isNaN(parsed)) return 0;
  return isNegative ? -parsed : parsed;
}

/**
 * Expresses an INR number in conversational words (Lakhs and Crores)
 * E.g. 1500000 -> "₹15 Lakhs", 25000000 -> "₹2.5 Crores"
 */
export function formatINRInWords(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    const cr = abs / 10000000;
    return `${sign}₹${cr.toFixed(cr % 1 === 0 ? 0 : 2)} Crore${cr > 1 ? 's' : ''}`;
  }
  if (abs >= 100000) {
    const l = abs / 100000;
    return `${sign}₹${l.toFixed(l % 1 === 0 ? 0 : 2)} Lakh${l > 1 ? 's' : ''}`;
  }
  if (abs >= 1000) {
    const k = abs / 1000;
    return `${sign}₹${k.toFixed(k % 1 === 0 ? 0 : 1)} Thousand`;
  }
  return `${sign}₹${abs}`;
}
