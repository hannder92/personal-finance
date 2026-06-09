// Time-of-day greeting slot (US-1). Pure function: hour in, i18n key suffix out.
// Slots: 5–11 morning, 12–18 afternoon, 19–4 evening.

export type GreetingSlot = 'morning' | 'afternoon' | 'evening'

export function greetingKey(hour: number): GreetingSlot {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 19) return 'afternoon'
  return 'evening'
}
