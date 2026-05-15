import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { useForm } from '@/composables/useForm'

const Schema = z.object({
  name: z.string().min(1),
  amount: z.number().min(0),
})

describe('useForm (T-048)', () => {
  it('validate() returns ok when values pass schema', () => {
    const f = useForm(Schema, { name: 'A', amount: 100 })
    const result = f.validate()
    expect(result.ok).toBe(true)
  })

  it('validate() returns errors map on failure', () => {
    const f = useForm(Schema, { name: '', amount: -1 })
    const result = f.validate()
    expect(result.ok).toBe(false)
    expect(f.errors.value.name).toBeTruthy()
    expect(f.errors.value.amount).toBeTruthy()
  })

  it('submit() calls onValid only when valid', () => {
    const onValid = vi.fn()
    const f = useForm(Schema, { name: 'A', amount: 1 }, onValid)
    f.submit()
    expect(onValid).toHaveBeenCalledOnce()
    expect(onValid).toHaveBeenCalledWith({ name: 'A', amount: 1 })
  })

  it('submit() does NOT call onValid when invalid', () => {
    const onValid = vi.fn()
    const f = useForm(Schema, { name: '', amount: 1 }, onValid)
    f.submit()
    expect(onValid).not.toHaveBeenCalled()
  })

  it('reset() restores initial values + clears errors', () => {
    const f = useForm(Schema, { name: 'A', amount: 1 })
    f.values.name = 'changed'
    f.validate()
    f.reset()
    expect(f.values.name).toBe('A')
    expect(Object.keys(f.errors.value).length).toBe(0)
  })
})
