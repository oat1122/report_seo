export const VAT_RATE = 0.07

export interface VatBreakdown {
  subtotal: number
  vat: number
  grandTotal: number
}

export function computeVatBreakdown(subtotal: number): VatBreakdown {
  const vat = subtotal * VAT_RATE
  return { subtotal, vat, grandTotal: subtotal + vat }
}
