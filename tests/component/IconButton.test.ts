import { fireEvent, render, screen } from '@testing-library/vue'
import { Trash2 } from 'lucide-vue-next'
import { describe, expect, it } from 'vitest'
import IconButton from '@/components/common/IconButton.vue'
import { i18n } from '@/i18n'

describe('IconButton (20260529-metricas-runway-ingresos)', () => {
  it('TC-C-065 (AC-5.4): exposes accessible name from i18n common.delete', () => {
    render(IconButton, {
      props: {
        label: i18n.global.t('common.delete'),
        icon: Trash2,
      },
      global: { plugins: [i18n] },
    })

    expect(screen.getByRole('button', { name: /eliminar|delete/i })).toBeTruthy()
  })

  it('TC-C-065 (AC-5.1): emits click when activated', async () => {
    const { emitted } = render(IconButton, {
      props: {
        label: 'Eliminar',
        icon: Trash2,
      },
      global: { plugins: [i18n] },
    })

    await fireEvent.click(screen.getByTestId('icon-button'))
    expect(emitted().click).toBeTruthy()
  })
})
