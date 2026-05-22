// shape ของ WorkProgressTemplateItem.defaultPeriods (Json?)
// key = period seq (string เพราะ JSON), value = { markTypeId }
// pure TS — ห้าม import @prisma/client / React / Next (rule 09)

export interface TemplateDefaultPeriodEntry {
  markTypeId: string;
}

export type TemplateDefaultPeriods = Record<string, TemplateDefaultPeriodEntry>;

export function parseTemplateDefaultPeriods(
  raw: unknown,
): TemplateDefaultPeriods {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: TemplateDefaultPeriods = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const markTypeId = (v as { markTypeId?: unknown }).markTypeId;
    if (typeof markTypeId !== "string" || markTypeId.length === 0) continue;
    out[k] = { markTypeId };
  }
  return out;
}
