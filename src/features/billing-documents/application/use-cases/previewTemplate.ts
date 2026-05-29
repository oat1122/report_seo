import type { BillingDocumentType } from '../../domain/DocumentType'
import type { DocumentGenerationDeps } from './render-data'
import { buildSampleRenderData, SAMPLE_COMPANY } from './preview-sample-data'

type PreviewTemplateDeps = Pick<
  DocumentGenerationDeps,
  'getCompanySettings' | 'renderDocumentHtml' | 'renderer'
>

export interface PreviewTemplateInput {
  type: BillingDocumentType
  includeVat?: boolean
  format?: 'html' | 'pdf'
}

export type PreviewTemplateResult =
  | { format: 'html'; html: string }
  | { format: 'pdf'; pdf: Buffer; filename: string }

// Dev-only: เรนเดอร์เทมเพลตเอกสารด้วยข้อมูลตัวอย่างเพื่อพรีวิวระหว่างพัฒนา
export const previewTemplateUseCase =
  (deps: PreviewTemplateDeps) =>
  async ({
    type,
    includeVat = false,
    format = 'html',
  }: PreviewTemplateInput): Promise<PreviewTemplateResult> => {
    const company = (await deps.getCompanySettings()) ?? SAMPLE_COMPANY
    const data = buildSampleRenderData(type, company, includeVat)
    const html = deps.renderDocumentHtml(data)

    if (format === 'pdf') {
      const pdf = await deps.renderer.renderToPdf(html)
      return { format: 'pdf', pdf, filename: `preview-${type}.pdf` }
    }

    return { format: 'html', html }
  }
