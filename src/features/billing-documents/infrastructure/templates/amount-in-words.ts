const ONES = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
]

const TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
]

const SCALES = ['', 'thousand', 'million', 'billion', 'trillion']

function threeDigitsToWords(value: number): string {
  const parts: string[] = []
  const hundreds = Math.floor(value / 100)
  const rest = value % 100

  if (hundreds > 0) {
    parts.push(`${ONES[hundreds]} hundred`)
  }

  if (rest > 0) {
    if (rest < 20) {
      parts.push(ONES[rest])
    } else {
      const tens = Math.floor(rest / 10)
      const ones = rest % 10
      parts.push(ones > 0 ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens])
    }
  }

  return parts.join(' ')
}

function integerToWords(value: number): string {
  if (value === 0) {
    return 'zero'
  }

  const groups: number[] = []
  let remaining = value
  while (remaining > 0) {
    groups.push(remaining % 1000)
    remaining = Math.floor(remaining / 1000)
  }

  const words: string[] = []
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue
    const chunk = threeDigitsToWords(groups[i])
    words.push(SCALES[i] ? `${chunk} ${SCALES[i]}` : chunk)
  }

  return words.join(' ')
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * แปลงจำนวนเงิน (THB) เป็นตัวหนังสือภาษาอังกฤษสำหรับแสดงบนเอกสารวางบิล
 * เช่น 1234.5 → "One thousand two hundred thirty-four baht and fifty satang"
 * เศษทศนิยมปัดเป็นสตางค์ (2 หลัก); ถ้าไม่มีเศษจะลงท้ายด้วย "only"
 */
export function formatAmountInWords(amount: number): string {
  const isNegative = amount < 0
  const absolute = Math.abs(amount)
  const baht = Math.floor(absolute)
  const satang = Math.round((absolute - baht) * 100)

  let result = `${integerToWords(baht)} baht`
  result += satang > 0 ? ` and ${integerToWords(satang)} satang` : ' only'

  const formatted = capitalize(result)
  return isNegative ? `Minus ${formatted}` : formatted
}
