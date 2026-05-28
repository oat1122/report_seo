import type {
  DocumentTemplate,
  DocumentTemplateDetail,
  DocumentTemplateItem,
  DocumentTemplateScope,
} from '../../domain/DocumentTemplate'

export interface TemplateItemInput {
  id?: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  orderIndex: number
}

export interface CreateTemplateData {
  name: string
  scope: DocumentTemplateScope
  isActive?: boolean
  items?: TemplateItemInput[]
}

export interface UpdateTemplateData {
  name?: string
  scope?: DocumentTemplateScope
  isActive?: boolean
}

export interface DocumentTemplateRepository {
  list(scope?: DocumentTemplateScope): Promise<DocumentTemplate[]>
  findById(id: string): Promise<DocumentTemplateDetail | null>
  create(data: CreateTemplateData): Promise<DocumentTemplateDetail>
  update(id: string, data: UpdateTemplateData): Promise<DocumentTemplate>
  delete(id: string): Promise<void>
  upsertItems(templateId: string, items: TemplateItemInput[]): Promise<DocumentTemplateItem[]>
}
