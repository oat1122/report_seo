'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatMoney } from './document-display'

export interface EditableItem {
  key: string
  description: string
  detail: string
  quantity: number
  unit: string
  unitPrice: number
}

let nextKey = 0
export function createItemKey() {
  return `item-${++nextKey}`
}

interface Props {
  items: EditableItem[]
  onItemsChange: (items: EditableItem[]) => void
  /** แสดงยอดรวมท้ายรายการ (ปิดเมื่อหน้ามีกล่องสรุปยอดแยก) */
  showTotal?: boolean
}

// คอลัมน์ตาม artboard: รายละเอียด · จำนวน · หน่วย · ราคา/หน่วย · รวม · ลบ
const ROW_GRID =
  'grid grid-cols-3 gap-2 sm:grid-cols-[minmax(0,1fr)_70px_84px_120px_110px_40px] sm:items-end'

export function DocumentItemsEditor({ items, onItemsChange, showTotal = true }: Props) {
  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

  const handleItemChange = (
    key: string,
    field: keyof Omit<EditableItem, 'key'>,
    value: string | number,
  ) => {
    onItemsChange(items.map((item) => (item.key === key ? { ...item, [field]: value } : item)))
  }

  const handleAddItem = () => {
    onItemsChange([
      ...items,
      {
        key: createItemKey(),
        description: '',
        detail: '',
        quantity: 1,
        unit: 'รายการ',
        unitPrice: 0,
      },
    ])
  }

  const handleRemoveItem = (key: string) => {
    onItemsChange(items.filter((item) => item.key !== key))
  }

  const inputClass = 'h-11 rounded-[10px] text-[13px] sm:h-10'

  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden className={`${ROW_GRID} text-text-secondary hidden px-0.5 text-xs sm:grid`}>
        <span>รายละเอียด</span>
        <span className="text-right">จำนวน</span>
        <span>หน่วย</span>
        <span className="text-right">ราคา/หน่วย</span>
        <span className="text-right">รวม</span>
        <span />
      </div>

      <ol className="flex flex-col gap-2.5">
        {items.map((item, index) => (
          <li
            key={item.key}
            className="border-border/70 flex flex-col gap-2 rounded-[14px] border bg-white/60 p-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 dark:bg-white/5 sm:dark:bg-transparent"
          >
            <div className={ROW_GRID}>
              <label className="col-span-3 flex min-w-0 flex-col gap-1 sm:col-span-1">
                <span className="text-text-secondary text-xs sm:sr-only">
                  รายละเอียดรายการที่ {index + 1}
                </span>
                <Input
                  value={item.description}
                  onChange={(e) => handleItemChange(item.key, 'description', e.target.value)}
                  placeholder="เช่น ค่าบริการ SEO รายเดือน"
                  className={inputClass}
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-text-secondary text-xs sm:sr-only">จำนวน</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(
                      item.key,
                      'quantity',
                      Math.max(1, parseInt(e.target.value) || 1),
                    )
                  }
                  className={`${inputClass} text-right tabular-nums`}
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-text-secondary text-xs sm:sr-only">หน่วย</span>
                <Input
                  value={item.unit}
                  onChange={(e) => handleItemChange(item.key, 'unit', e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1">
                <span className="text-text-secondary text-xs sm:sr-only">ราคาต่อหน่วย</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={0.01}
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemChange(
                      item.key,
                      'unitPrice',
                      Math.max(0, parseFloat(e.target.value) || 0),
                    )
                  }
                  className={`${inputClass} text-right tabular-nums`}
                />
              </label>
              <p className="col-span-2 flex h-11 items-center justify-start gap-1.5 text-sm font-semibold tabular-nums sm:col-span-1 sm:h-10 sm:justify-end">
                <span className="text-text-secondary text-xs font-normal sm:sr-only">รวม</span>
                {formatMoney(item.quantity * item.unitPrice)}
              </p>
              <div className="flex items-center justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemoveItem(item.key)}
                  disabled={items.length <= 1}
                  aria-label={`ลบรายการที่ ${index + 1}`}
                  className="text-danger-strong hover:bg-danger-subtle hover:text-danger-strong max-sm:size-11"
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
            </div>
            <label className="flex flex-col gap-1">
              <span className="sr-only">รายละเอียดเพิ่มเติมของรายการที่ {index + 1}</span>
              <Textarea
                value={item.detail}
                onChange={(e) => handleItemChange(item.key, 'detail', e.target.value)}
                placeholder="รายละเอียดเพิ่มเติม (ขึ้นบรรทัดใหม่ได้ · ขึ้นต้นด้วย . หรือ - = หัวข้อย่อย)"
                className="min-h-14 rounded-[10px] text-[13px]"
              />
            </label>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          className="border-accent bg-info-subtle/40 hover:bg-info-subtle border-dashed"
        >
          <Plus aria-hidden />
          เพิ่มรายการ
        </Button>
        {showTotal && (
          <p className="text-text-secondary text-sm">
            รวมทั้งสิ้น:{' '}
            <span className="text-foreground font-semibold tabular-nums">
              {formatMoney(total)} บาท
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
