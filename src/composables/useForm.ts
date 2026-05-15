import { reactive, ref } from 'vue'
import type { z } from 'zod'

type ValidateOk = { ok: true }
type ValidateErr = { ok: false; errors: Record<string, string> }
type ValidateResult = ValidateOk | ValidateErr

export function useForm<T extends Record<string, unknown>>(
  schema: z.ZodType<T>,
  initial: T,
  onValid?: (values: T) => void
) {
  const values = reactive({ ...initial }) as T
  const errors = ref<Record<string, string>>({})

  function validate(): ValidateResult {
    const result = schema.safeParse(values)
    if (result.success) {
      errors.value = {}
      return { ok: true }
    }
    const next: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const key = issue.path.join('.')
      if (key && !next[key]) next[key] = issue.message
    }
    errors.value = next
    return { ok: false, errors: next }
  }

  function submit() {
    const result = validate()
    if (result.ok && onValid) onValid(values as T)
  }

  function reset() {
    Object.keys(values).forEach((k) => delete (values as Record<string, unknown>)[k])
    Object.assign(values, initial)
    errors.value = {}
  }

  return { values, errors, validate, submit, reset }
}
