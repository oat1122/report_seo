import { notFound } from 'next/navigation'
import { TemplatePreview } from '@/features/billing-documents/presentation/components/dev/TemplatePreview'

export default function BillingTemplatesDevPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return <TemplatePreview />
}
