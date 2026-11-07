export type Currency = 'VND' | 'EUR'

const formatters: Record<Currency, Intl.NumberFormat> = {
  VND: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }),
  EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }),
}

/** Money is shown in VND in Vietnam and EUR in Germany (plan §5). */
export function formatMoney(amount: number, currency: Currency = 'VND'): string {
  return formatters[currency].format(amount)
}
