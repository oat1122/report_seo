import type { ZodTypeAny, z } from 'zod'
import { BadRequestError } from '@/lib/errors'

export async function parseJsonBody<S extends ZodTypeAny>(
  req: Request,
  schema: S,
): Promise<z.infer<S>> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    throw new BadRequestError('Invalid JSON body')
  }
  return schema.parse(raw)
}

export function parseQuery<S extends ZodTypeAny>(req: Request, schema: S): z.infer<S> {
  const { searchParams } = new URL(req.url)
  return schema.parse(Object.fromEntries(searchParams))
}

export function parseParams<S extends ZodTypeAny>(raw: unknown, schema: S): z.infer<S> {
  return schema.parse(raw)
}
