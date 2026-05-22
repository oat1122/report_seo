import type {
  MetaValueType,
  WorkProgressItemMeta,
} from "../../domain/WorkProgressItemMeta";

export interface UpsertMetaData {
  itemId: string;
  key: string;
  value: string;
  valueType: MetaValueType;
}

export interface WorkProgressItemMetaRepository {
  listByItem(itemId: string): Promise<WorkProgressItemMeta[]>;
  upsert(data: UpsertMetaData): Promise<WorkProgressItemMeta>;
  upsertMany(
    itemId: string,
    entries: ReadonlyArray<Omit<UpsertMetaData, "itemId">>,
  ): Promise<WorkProgressItemMeta[]>;
  delete(itemId: string, key: string): Promise<void>;
}
