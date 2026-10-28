import { expect, test, type Page } from '@playwright/test'
import fixtures from '../src/core/fixtures'

const cell = (page: Page, row = 0, column = 0) => page.getByRole('button', { name: `Cell at row ${row + 1}, column ${column + 1}`, exact: true })
const visibleCandidates = (page: Page, row = 0, column = 0) => cell(page, row, column).locator('.candidates')

async function importPuzzle(page: Page, text: string = fixtures['Simple sudoku']) {
   await page.getByRole('tab', { name: 'solving tools', exact: true }).click()
   await page.getByRole('button', { name: 'import', exact: true }).click()
   await page.getByLabel('Enter digits or candidates').fill(text)
   await page.getByRole('button', { name: 'Submit', exact: true }).click()
   await expect(page.getByRole('dialog')).toHaveCount(0)
}

test.beforeEach(async ({ page }) => {
   page.on('pageerror', error => console.error('Browser runtime error:', error.message))
   await page.goto('/')
})

test.afterEach(async ({ page }, info) => {
   if (info.status !== info.expectedStatus) {
      console.log('Failure state:', await page.evaluate(() => ({
         focus: document.activeElement?.outerHTML,
         cell: document.querySelector('[data-cell="0"]')?.outerHTML,
      })))
   }
})

test('candidate editing, reset, empty state, and undo', async ({ page }) => {
   await cell(page).click()
   await page.keyboard.type('123')
   await expect(visibleCandidates(page)).toHaveText('123')
   await page.keyboard.press('Control+Backspace')
   await expect(cell(page)).toHaveAttribute('data-error', 'true')
   await page.keyboard.type('7')
   await page.keyboard.press('Escape')
   await expect(cell(page).locator('.digit')).toHaveText('7')
   await page.getByRole('button', { name: 'undo', exact: true }).click()
   await expect(cell(page)).toHaveAttribute('data-error', 'true')
   await cell(page).click()
   await expect(cell(page)).toBeFocused()
   await page.keyboard.press('Backspace')
   await expect(cell(page)).not.toHaveAttribute('data-error')
   await page.keyboard.press('Escape')
   await expect(cell(page).locator('.digit')).toHaveCount(0)
   await expect(cell(page)).not.toHaveAttribute('data-error')
})

test('all nine candidates disappear when an untouched cell loses focus', async ({ page }) => {
   await cell(page).click()
   await page.keyboard.type('123456789')
   await expect(visibleCandidates(page)).toHaveText('123456789')
   await page.keyboard.press('Escape')
   await expect(visibleCandidates(page)).toHaveCount(0)
})

test('Ctrl selection edits multiple cells and survives blur', async ({ page }) => {
   await cell(page).click()
   await page.keyboard.type('123')
   await page.keyboard.down('Control')
   await cell(page, 0, 1).click()
   await page.keyboard.type('456')
   await page.keyboard.up('Control')
   await expect(visibleCandidates(page)).toHaveText('123456')
   await expect(visibleCandidates(page, 0, 1)).toHaveText('456')
   await page.getByRole('tab', { name: 'solving tools', exact: true }).click()
   await expect(cell(page)).toHaveAttribute('data-active', 'false')
   await cell(page).click()
   await expect(cell(page, 0, 1)).toHaveAttribute('data-active', 'true')
   await page.keyboard.press('Escape')
   await expect(page.locator('[aria-selected="true"][role="gridcell"]')).toHaveCount(0)
})

test('Ctrl+A selects and edits the whole board', async ({ page }) => {
   await cell(page).click()
   await page.keyboard.press('Control+a')
   await expect(page.locator('[aria-selected="true"][role="gridcell"]')).toHaveCount(81)
   await page.keyboard.press('Control+Delete')
   await expect(page.locator('[data-error="true"]')).toHaveCount(81)
   await page.keyboard.type('6')
   await page.keyboard.press('Escape')
   await expect(page.locator('.digit')).toHaveCount(81)
})

test('navigation wraps and supports Home, End, Page Up/Down, and Tab', async ({ page }) => {
   await cell(page, 0, 8).click()
   for (const [key, row, column] of [
      ['Tab', 1, 0], ['ArrowLeft', 1, 8], ['ArrowUp', 0, 8], ['ArrowUp', 8, 8],
      ['Home', 8, 0], ['Control+Home', 0, 0], ['End', 0, 8], ['Control+End', 8, 8],
      ['PageUp', 5, 8], ['PageUp', 2, 8], ['PageUp', 0, 8], ['PageDown', 3, 8],
   ] as const) {
      await page.keyboard.press(key)
      await expect(cell(page, row, column)).toBeFocused()
   }
})

test('import/export candidate round trip and modal focus restoration', async ({ page }) => {
   await importPuzzle(page)
   await expect(cell(page).locator('.digit')).toHaveText('6')
   const trigger = page.getByRole('button', { name: 'export', exact: true })
   await trigger.click()
   const candidates = await page.getByLabel('729-character candidates').inputValue()
   expect(candidates).toHaveLength(729)
   await page.keyboard.press('Escape')
   await expect(trigger).toBeFocused()
   await page.getByRole('button', { name: 'clear', exact: true }).click()
   await expect(page.locator('.digit')).toHaveCount(0)
   await importPuzzle(page, candidates)
   await expect(cell(page).locator('.digit')).toHaveText('6')
})

test('malformed input stays in the dialog and leaves the board unchanged', async ({ page }) => {
   await importPuzzle(page)
   await page.getByRole('button', { name: 'import', exact: true }).click()
   await page.getByLabel('Enter digits or candidates').fill('not a puzzle')
   await page.getByRole('button', { name: 'Submit', exact: true }).click()
   await expect(page.getByRole('alert')).toContainText('Could not read')
   await page.getByRole('button', { name: 'Cancel', exact: true }).click()
   await expect(cell(page).locator('.digit')).toHaveText('6')
})

test('step, Go, candidate diffs, explanation, and solver undo', async ({ page }) => {
   await importPuzzle(page)
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   await expect(page.getByRole('switch')).toHaveCount(17)
   await page.getByRole('button', { name: 'step', exact: true }).click()
   await expect(page.getByLabel('Status for Check for solved', { exact: true })).toHaveText(String(fixtures['Simple sudoku'].replace(/[^1-9]/g, '').length))
   await page.getByRole('button', { name: 'step', exact: true }).click()
   await expect(page.locator('.candidate.eliminated').first()).toBeVisible()
   await expect(page.locator('.explanation')).toContainText('Update candidates')
   await page.getByRole('button', { name: 'undo', exact: true }).click()
   await expect(page.locator('.candidate.eliminated')).toHaveCount(0)
   await page.getByRole('button', { name: 'go', exact: true }).click()
   await expect(page.locator('.candidate.eliminated').first()).toBeVisible()
})

test('strategy toggles and results persist across tabs', async ({ page }) => {
   await importPuzzle(page)
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   await page.getByRole('switch', { name: 'Toggle Update candidates', exact: true }).uncheck()
   await page.getByRole('button', { name: 'step', exact: true }).click()
   await page.getByRole('button', { name: 'step', exact: true }).click()
   await expect(page.getByLabel('Status for Update candidates', { exact: true })).toBeEmpty()
   await page.getByRole('tab', { name: 'solving tools', exact: true }).click()
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   await expect(page.getByRole('switch', { name: 'Toggle Update candidates', exact: true })).not.toBeChecked()
   await expect(page.getByLabel('Status for Check for solved', { exact: true })).not.toBeEmpty()
})

test('tabs support arrows, Home, and End', async ({ page }) => {
   const tools = page.getByRole('tab', { name: 'solving tools', exact: true })
   const strategies = page.getByRole('tab', { name: 'strategies', exact: true })
   await tools.focus()
   await page.keyboard.press('ArrowRight')
   await expect(strategies).toBeFocused()
   await expect(strategies).toHaveAttribute('aria-selected', 'true')
   await page.keyboard.press('Home')
   await expect(tools).toBeFocused()
   await page.keyboard.press('End')
   await expect(strategies).toBeFocused()
})

test('invalid and solved puzzles announce outcomes', async ({ page }) => {
   await importPuzzle(page, fixtures['Invalid board'])
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   await page.getByRole('button', { name: 'go', exact: true }).click()
   await expect(page.getByRole('status')).toHaveClass(/error/)
   await importPuzzle(page, fixtures['Solved board'])
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   await page.getByRole('button', { name: 'go', exact: true }).click()
   await expect(page.getByRole('status')).toHaveText('Finished! :D')
})

test('the app fits its viewport without horizontal scrolling or runtime errors', async ({ page }) => {
   const errors: string[] = []
   page.on('pageerror', error => errors.push(error.message))
   await page.reload()
   await expect(page.getByRole('grid', { name: 'Sudoku' })).toBeVisible()
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
   expect(errors).toEqual([])
})
