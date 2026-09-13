export const QUAYVOX_CARRIER = 'Quayvox - Global Logistics';

export const DEFAULT_COST_CURRENCY = 'USD';

/** Currencies available when setting an optional shipment cost in admin. */
export const COST_CURRENCIES = [
  { code: 'USD', label: 'US Dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'CHF', label: 'Swiss Franc' },
  { code: 'CNY', label: 'Chinese Yuan' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'PLN', label: 'Polish Zloty' },
  { code: 'NGN', label: 'Nigerian Naira' },
  { code: 'INR', label: 'Indian Rupee' },
  { code: 'AED', label: 'UAE Dirham' },
] as const;

export type CostCurrencyCode = (typeof COST_CURRENCIES)[number]['code'];

export const COST_CURRENCY_CODES = COST_CURRENCIES.map((c) => c.code) as CostCurrencyCode[];

export function isCostCurrencyCode(value: string): value is CostCurrencyCode {
  return (COST_CURRENCY_CODES as string[]).includes(value);
}

/** Format optional shipment cost; empty / zero cost shows as an em dash. */
export function formatShipmentCost(
  cost: number | null | undefined,
  currency: string | null | undefined = DEFAULT_COST_CURRENCY
): string {
  if (cost == null || !Number.isFinite(cost) || cost <= 0) return '—';
  const code = currency && isCostCurrencyCode(currency) ? currency : DEFAULT_COST_CURRENCY;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: code === 'JPY' ? 0 : 2,
    }).format(cost);
  } catch {
    return `${code} ${cost.toLocaleString()}`;
  }
}
