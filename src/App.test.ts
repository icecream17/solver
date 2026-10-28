// @vitest-environment jsdom
import { afterEach, beforeAll, expect, test } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import App from './App.svelte'
import fixtures from './core/fixtures'

// jsdom does not implement native dialog layout/focus management. The browser
// suite covers that contract; these shims only let component interactions run.
beforeAll(() => {
   HTMLDialogElement.prototype.showModal = function () {
      this.open = true
      this.querySelector<HTMLElement>('textarea, button')?.focus()
   }
   HTMLDialogElement.prototype.close = function () { this.open = false }
})
afterEach(cleanup)

const cell = (row = 0, column = 0) => screen.getByRole('button', { name: `Cell at row ${row + 1}, column ${column + 1}` })
const candidates = (row = 0, column = 0) => cell(row, column).querySelector('.candidates')?.textContent?.replace(/\s/g, '')
const user = () => userEvent.setup()

async function importPuzzle(u: ReturnType<typeof user>, representation: string = fixtures['Simple sudoku']) {
   await u.click(screen.getByRole('tab', { name: 'solving tools' }))
   await u.click(screen.getByRole('button', { name: 'import' }))
   await u.click(screen.getByLabelText('Enter digits or candidates'))
   await u.paste(representation)
   await u.click(screen.getByRole('button', { name: 'Submit' }))
   await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
}

test('first entry, candidate toggling, reset, empty error, and edit undo', async () => {
   render(App)
   const u = user()
   await u.click(cell())
   await u.keyboard('123')
   expect(candidates()).toBe('123')
   await u.keyboard('{Control>}{Backspace}{/Control}')
   expect(cell().hasAttribute('data-error')).toBe(true)
   await u.keyboard('7{Escape}')
   expect(cell().querySelector('.digit')?.textContent).toBe('7')
   await u.click(screen.getByRole('button', { name: 'undo' }))
   expect(cell().hasAttribute('data-error')).toBe(true)
   await u.click(cell())
   await u.keyboard('{Backspace}{Escape}')
   expect(cell().hasAttribute('data-error')).toBe(false)
   expect(cell().querySelector('.digit')).toBeNull()
})

test('all candidates display while editing and hide after Escape', async () => {
   render(App)
   const u = user()
   await u.click(cell())
   await u.keyboard('123456789')
   expect(candidates()).toBe('123456789')
   await u.keyboard('{Escape}')
   expect(candidates()).toBeUndefined()
})

test('multiselection edits all selected cells and resumes after blur', async () => {
   render(App)
   const u = user()
   await u.click(cell())
   await u.keyboard('123{Control>}')
   await u.click(cell(0, 1))
   await u.keyboard('456{/Control}')
   expect(candidates()).toBe('123456')
   expect(candidates(0, 1)).toBe('456')
   await u.click(screen.getByRole('tab', { name: 'solving tools' }))
   expect(cell().getAttribute('data-active')).toBe('false')
   await u.click(cell())
   expect(cell(0, 1).getAttribute('data-active')).toBe('true')
   await u.keyboard('{Escape}')
   expect(document.querySelectorAll('td[aria-selected="true"]').length).toBe(0)
})

test('Ctrl+A and the empty-candidates modifier affect the entire board', async () => {
   render(App)
   const u = user()
   await u.click(cell())
   await u.keyboard('{Control>}a{Delete}{/Control}')
   expect(document.querySelectorAll('[data-error]').length).toBe(81)
   await u.keyboard('6{Escape}')
   expect(document.querySelectorAll('.digit').length).toBe(81)
})

test('navigation, including native Tab, wrapping, Home/End, Page Up/Down', async () => {
   render(App)
   const u = user()
   await u.click(cell(0, 8))
   for (const [key, row, column] of [
      ['{Tab}', 1, 0], ['{ArrowLeft}', 1, 8], ['{ArrowUp}', 0, 8], ['{ArrowUp}', 8, 8],
      ['{Home}', 8, 0], ['{Control>}{Home}{/Control}', 0, 0], ['{End}', 0, 8],
      ['{Control>}{End}{/Control}', 8, 8], ['{PageUp}', 5, 8], ['{PageDown}', 8, 8],
   ] as const) {
      await u.keyboard(key)
      expect(document.activeElement).toBe(cell(row, column))
   }
})

test('window blur releases held navigation keys', async () => {
   render(App)
   const u = user()
   await u.click(cell())
   await u.keyboard('{ArrowRight>}')
   await fireEvent(window, new Event('blur'))
   await u.click(cell())
   await fireEvent.keyDown(cell(), { key: 'ArrowDown', repeat: true })
   expect(document.activeElement).toBe(cell(1, 0))
})

test('import/export round trip preserves candidates and restores dialog trigger focus', async () => {
   render(App)
   const u = user()
   await importPuzzle(u)
   expect(cell().querySelector('.digit')?.textContent).toBe('6')
   const trigger = screen.getByRole('button', { name: 'export' })
   await u.click(trigger)
   const representation = (screen.getByLabelText('729-character candidates') as HTMLTextAreaElement).value
   expect(representation).toHaveLength(729)
   await u.click(screen.getByRole('button', { name: 'Close' }))
   expect(document.activeElement).toBe(trigger)
   await u.click(screen.getByRole('button', { name: 'clear' }))
   expect(cell().querySelector('.digit')).toBeNull()
   await importPuzzle(u, representation)
   expect(cell().querySelector('.digit')?.textContent).toBe('6')
})

test('bad imports show an error without overwriting the board', async () => {
   render(App)
   const u = user()
   await importPuzzle(u)
   await u.click(screen.getByRole('button', { name: 'import' }))
   await u.type(screen.getByLabelText('Enter digits or candidates'), 'not a puzzle')
   await u.click(screen.getByRole('button', { name: 'Submit' }))
   expect(screen.getByRole('alert').textContent).toContain('Could not read')
   await u.click(screen.getByRole('button', { name: 'Cancel' }))
   expect(cell().querySelector('.digit')?.textContent).toBe('6')
})

test('solver steps, diffs, explanation, and undo have no component timing dependency', async () => {
   render(App)
   const u = user()
   await importPuzzle(u)
   await u.click(screen.getByRole('tab', { name: 'strategies' }))
   expect(screen.getAllByRole('switch').length).toBe(17)
   await u.click(screen.getByRole('button', { name: 'step' }))
   expect(screen.getByLabelText('Status for Check for solved').textContent).toBe(String(fixtures['Simple sudoku'].replace(/[^1-9]/g, '').length))
   await u.click(screen.getByRole('button', { name: 'step' }))
   expect(document.querySelectorAll('.eliminated.candidate').length).toBeGreaterThan(0)
   expect(document.querySelector('.explanation')?.textContent).toContain('Update candidates')
   await u.click(screen.getByRole('button', { name: 'undo' }))
   expect(document.querySelectorAll('.eliminated.candidate').length).toBe(0)
   await u.click(screen.getByRole('button', { name: 'go' }))
   expect(document.querySelectorAll('.eliminated.candidate').length).toBeGreaterThan(0)
})

test('toggles and results survive tab changes, and disabled strategies are skipped', async () => {
   render(App)
   const u = user()
   await importPuzzle(u)
   await u.click(screen.getByRole('tab', { name: 'strategies' }))
   await u.click(screen.getByRole('switch', { name: 'Toggle Update candidates' }))
   await u.click(screen.getByRole('button', { name: 'step' }))
   await u.click(screen.getByRole('button', { name: 'step' }))
   expect(screen.getByLabelText('Status for Update candidates').textContent).toBe('')
   await u.click(screen.getByRole('tab', { name: 'solving tools' }))
   await u.click(screen.getByRole('tab', { name: 'strategies' }))
   expect((screen.getByRole('switch', { name: 'Toggle Update candidates' }) as HTMLInputElement).checked).toBe(false)
   expect(screen.getByLabelText('Status for Check for solved').textContent).not.toBe('')
})

test('tabs expose keyboard focus and selection with Arrow/Home/End', async () => {
   render(App)
   const u = user()
   const tools = screen.getByRole('tab', { name: 'solving tools' })
   const strategies = screen.getByRole('tab', { name: 'strategies' })
   tools.focus()
   await u.keyboard('{ArrowRight}')
   expect(document.activeElement).toBe(strategies)
   expect(strategies.getAttribute('aria-selected')).toBe('true')
   await u.keyboard('{Home}')
   expect(document.activeElement).toBe(tools)
   await u.keyboard('{End}')
   expect(document.activeElement).toBe(strategies)
})

test('invalid and solved boards announce their outcomes', async () => {
   render(App)
   const u = user()
   await importPuzzle(u, fixtures['Invalid board'])
   await u.click(screen.getByRole('tab', { name: 'strategies' }))
   await u.click(screen.getByRole('button', { name: 'go' }))
   expect(screen.getByRole('status').classList.contains('error')).toBe(true)
   await importPuzzle(u, fixtures['Solved board'])
   await u.click(screen.getByRole('tab', { name: 'strategies' }))
   await u.click(screen.getByRole('button', { name: 'go' }))
   expect(screen.getByRole('status').textContent).toBe('Finished! :D')
})


test('clicking a displayed digit keeps keyboard focus while switching to candidate editing', async () => {
   render(App)
   const u = user()
   await importPuzzle(u)
   const digit = cell().querySelector('.digit')!
   await fireEvent.pointerDown(digit, { bubbles: true, cancelable: true })
   expect(document.activeElement).toBe(cell())
   await u.keyboard('{Backspace}{Escape}')
   expect(cell().hasAttribute('data-error')).toBe(false)
   expect(cell().querySelector('.digit')).toBeNull()
})
