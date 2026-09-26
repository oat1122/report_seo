import type { ZodError } from 'zod'

export type FieldErrors = Record<string, string>

export function parseFieldErrors(error: ZodError): FieldErrors {
  const result: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString()
    if (key && !result[key]) result[key] = issue.message
  }
  return result
}

// ข้อความ error ใต้ช่องกรอก — ส่ง id ให้ช่องอ้างถึงด้วย aria-describedby
export function FieldError({ error, id }: { error?: string; id?: string }) {
  if (!error) return null
  return (
    <p id={id} role="alert" className="text-danger-strong text-xs">
      {error}
    </p>
  )
}
