export interface DocumentItem {
  id: string;
  customerId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}
