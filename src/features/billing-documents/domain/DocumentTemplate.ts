export type DocumentTemplateScope = "GENERAL" | "PLAN";

export interface DocumentTemplate {
  id: string;
  name: string;
  scope: DocumentTemplateScope;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentTemplateItem {
  id: string;
  templateId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  orderIndex: number;
}

export interface DocumentTemplateDetail extends DocumentTemplate {
  items: DocumentTemplateItem[];
}
