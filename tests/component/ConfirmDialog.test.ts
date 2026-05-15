import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

describe('ConfirmDialog (AC-17.8)', () => {
  it('AC-17.8: renders title and message when open=true', () => {
    render(ConfirmDialog, {
      props: {
        open: true,
        title: 'Eliminar gasto',
        message: '¿Confirmas que deseas eliminar este gasto?',
      },
    })

    expect(screen.getByText('Eliminar gasto')).toBeTruthy()
    expect(screen.getByText('¿Confirmas que deseas eliminar este gasto?')).toBeTruthy()
  })

  it('AC-17.8: does NOT render dialog when open=false', () => {
    render(ConfirmDialog, {
      props: {
        open: false,
        title: 'Eliminar gasto',
        message: '¿Confirmas?',
      },
    })

    // Both: title not present AND no dialog role exists.
    expect(screen.queryByText('Eliminar gasto')).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('AC-17.8: exposes role="dialog" with aria-modal when open=true', () => {
    render(ConfirmDialog, {
      props: { open: true, title: 'T', message: 'M' },
    })

    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })

  it('AC-17.8: emits confirm when confirm button clicked', async () => {
    const { emitted } = render(ConfirmDialog, {
      props: {
        open: true,
        title: 'Title',
        message: 'Msg',
        confirmLabel: 'Sí',
        cancelLabel: 'No',
      },
    })

    const confirmBtn = screen.getByRole('button', { name: /sí/i })
    await fireEvent.click(confirmBtn)

    expect(emitted()).toHaveProperty('confirm')
  })

  it('AC-17.8: emits cancel + update:open=false when cancel clicked', async () => {
    const { emitted } = render(ConfirmDialog, {
      props: {
        open: true,
        title: 'Title',
        message: 'Msg',
        confirmLabel: 'Sí',
        cancelLabel: 'No',
      },
    })

    const cancelBtn = screen.getByRole('button', { name: /no/i })
    await fireEvent.click(cancelBtn)

    expect(emitted()).toHaveProperty('cancel')
    const updateOpen = emitted('update:open') as unknown[][] | undefined
    expect(updateOpen?.[0]?.[0]).toBe(false)
  })
})

// Silence vue warnings noise about Suspense boundary in tests
vi.spyOn(console, 'warn').mockImplementation(() => {})
