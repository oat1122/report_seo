export type MetaValueType = "string" | "number" | "date" | "json";

export interface WorkProgressItemMeta {
  id: string;
  itemId: string;
  key: string;
  value: string;
  valueType: MetaValueType;
  createdAt: Date;
  updatedAt: Date;
}
