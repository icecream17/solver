import { expect, test, type Page } from '@playwright/test'
import fixtures from '../src/core/fixtures'
import { DENSE_BIVALUE_BOARD } from '../src/core/stress-boards'

const cell = (page: Page, row = 0, column = 0) =>
   page.getByRole('button', {
      name: `Cell at row ${row + 1}, column ${column + 1}`,
      exact: true
   })
const visibleCandidates = (page: Page, row = 0, column = 0) =>
   cell(page, row, column).locator('.candidates')

async function importPuzzle(page: Page, text: string = fixtures['Simple sudoku']) {
   await page.getByRole('tab', { name: 'solving tools', exact: true }).click()
   await page.getByRole('button', { name: 'import', exact: true }).click()
   await page.getByLabel('Enter digits or candidates').fill(text)
   await page.getByRole('button', { name: 'Submit', exact: true }).click()
   await expect(page.getByRole('dialog')).toHaveCount(0)
}

test.beforeEach(async ({ page }) => {
   page.on('pageerror', (error) => console.error('Browser runtime error:', error.message))
   await page.goto('/')
})

test.afterEach(async ({ page }, info) => {
   if (info.status !== info.expectedStatus) {
      console.log(
         'Failure state:',
         await page.evaluate(() => ({
            focus: document.activeElement?.outerHTML,
            cell: document.querySelector('[data-cell="0"]')?.outerHTML
         }))
      )
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
      ['Tab', 1, 0],
      ['ArrowLeft', 1, 8],
      ['ArrowUp', 0, 8],
      ['ArrowUp', 8, 8],
      ['Home', 8, 0],
      ['Control+Home', 0, 0],
      ['End', 0, 8],
      ['Control+End', 8, 8],
      ['PageUp', 5, 8],
      ['PageUp', 2, 8],
      ['PageUp', 0, 8],
      ['PageDown', 3, 8]
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
   await expect(page.getByLabel('Status for Check for solved', { exact: true })).toHaveText(
      String(fixtures['Simple sudoku'].replace(/[^1-9]/g, '').length)
   )
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
   await expect(
      page.getByRole('switch', { name: 'Toggle Update candidates', exact: true })
   ).not.toBeChecked()
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

test('the app fits its viewport without horizontal scrolling or runtime errors', async ({
   page
}) => {
   const errors: string[] = []
   page.on('pageerror', (error) => errors.push(error.message))
   await page.reload()
   await expect(page.getByRole('grid', { name: 'Sudoku' })).toBeVisible()
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
   expect(errors).toEqual([])
})

test('clicking an imported digit retains focus when the display switches to candidates', async ({
   page
}) => {
   await importPuzzle(page)
   await cell(page).locator('.digit').click()
   await expect(cell(page)).toBeFocused()
   await page.keyboard.press('Backspace')
   await page.keyboard.press('Escape')
   await expect(cell(page)).not.toHaveAttribute('data-error')
   await expect(cell(page).locator('.digit')).toHaveCount(0)
})

test('keyboard Undo restores the next digit as a new entry', async ({ page }) => {
   await cell(page).click()
   await page.keyboard.type('1')
   await page.keyboard.press('Control+z')
   await page.keyboard.type('2')
   await page.keyboard.press('Escape')
   await expect(cell(page).locator('.digit')).toHaveText('2')
})

test('re-enabled propagation runs even if the solved count did not change', async ({ page }) => {
   await importPuzzle(page, '1' + '.'.repeat(80))
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   const propagation = page.getByRole('switch', { name: 'Toggle Update candidates', exact: true })
   await propagation.uncheck()
   await page.getByRole('button', { name: 'go', exact: true }).click()
   await expect(page.getByRole('status')).toContainText('No more progress')
   await propagation.check()
   await page.getByRole('button', { name: 'go', exact: true }).click()
   await expect(page.getByLabel('Status for Update candidates', { exact: true })).toHaveText('20')
   await expect(cell(page, 0, 1)).toHaveAccessibleDescription(/Eliminated: 1/)
   await expect(cell(page, 0, 1).locator('.candidate s')).toHaveText('1')
})

test('a dense chain search is cancellable without freezing the page', async ({ page }) => {
   await importPuzzle(page, DENSE_BIVALUE_BOARD)
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   await page.getByRole('button', { name: 'go', exact: true }).click()
   await expect(page.getByRole('status')).toContainText('XY Ring')
   await page.getByRole('button', { name: 'cancel solving', exact: true }).click()
   await expect(page.getByRole('status')).toContainText('cancelled')
   await page.getByRole('tab', { name: 'solving tools', exact: true }).click()
   await page.getByRole('button', { name: 'clear', exact: true }).click()
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   await page.getByRole('button', { name: 'go', exact: true }).click()
   await expect(page.getByRole('status')).toContainText('No more progress')
})

test('touch users can enter a puzzle without a physical keyboard', async ({ page, isMobile }) => {
   test.skip(!isMobile, 'Touch entry is exercised by the mobile project.')
   await cell(page).tap()
   await page.getByRole('button', { name: 'Toggle candidate 5', exact: true }).tap()
   await expect(cell(page).locator('.digit')).toHaveText('5')
   await page.getByRole('button', { name: 'reset candidates', exact: true }).tap()
   await expect(cell(page).locator('.digit')).toHaveCount(0)
})

// Synthetic marks isolate the CSS precedence without depending on a strategy fixture.
test('selected reason cells retain readable text, a single gradient, and candidate inset', async ({
   page
}) => {
   await cell(page).click()
   await page.keyboard.type('123')
   await cell(page).evaluate((button) => button.closest('td')?.classList.add('blue'))
   await expect(cell(page)).toHaveCSS('color', 'rgb(245, 245, 245)')
   await expect(cell(page)).toHaveCSS('background-color', 'rgb(85, 85, 85)')
   const inset = await visibleCandidates(page).evaluate((grid) =>
      parseFloat(getComputedStyle(grid).paddingTop)
   )
   expect(inset).toBeGreaterThan(0)
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   await expect(cell(page)).toHaveCSS('color', 'rgb(245, 245, 245)')
   const background = await cell(page).evaluate(
      (button) => getComputedStyle(button).backgroundImage
   )
   expect(background).toMatch(/^linear-gradient/)
})

test('strategy columns align at narrow widths and across the layout breakpoint', async ({
   page
}) => {
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   // Populate every result slot to exercise text wrapping, including linked rows.
   await page.locator('.strategy-result').evaluateAll((results) => {
      for (const result of results) result.textContent = 'Yes'
   })
   for (const width of [320, 390, 899, 900, 901, 1280]) {
      await page.setViewportSize({ width, height: 844 })
      for (const direction of ['ltr', 'rtl']) {
         await page
            .locator('html')
            .evaluate((root, dir) => root.setAttribute('dir', dir), direction)
         const rows = await page.locator('.strategy-row').evaluateAll((elements) =>
            elements.map((element) => {
               const label = element.querySelector('.strategy-name')!.getBoundingClientRect()
               const result = element.querySelector('.strategy-result')!.getBoundingClientRect()
               return {
                  labelTop: label.top,
                  labelBottom: label.bottom,
                  resultTop: result.top,
                  left: result.left
               }
            })
         )
         for (const row of rows) {
            expect(row.resultTop).toBeGreaterThanOrEqual(row.labelTop - 2)
            expect(row.resultTop).toBeLessThan(row.labelBottom)
            expect(Math.abs(row.left - rows[0].left)).toBeLessThan(1)
         }
         expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
            true
         )
      }
      await cell(page).click()
      const fontSize = await cell(page)
         .locator('.candidate')
         .first()
         .evaluate((candidate) => parseFloat(getComputedStyle(candidate).fontSize))
      expect(fontSize).toBeGreaterThanOrEqual(8.8)
   }
})

test('current strategy retains its edge marker and the print palette is light', async ({
   page
}) => {
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   await page.getByRole('button', { name: 'step', exact: true }).click()
   const current = page.locator('.strategy-list li.current')
   await expect(current).toHaveCount(1)
   await expect(current).toHaveCSS('border-inline-start-width', '4px')
   await expect(current).toHaveCSS('border-inline-start-style', 'solid')
   await page.emulateMedia({ forcedColors: 'active' })
   await expect(current).toHaveCSS('border-inline-start-style', 'solid')
   const marker = await current.evaluate((row) => {
      const style = getComputedStyle(row)
      return { border: style.borderInlineStartColor, background: style.backgroundColor }
   })
   expect(marker.border).not.toBe(marker.background)
   await page.emulateMedia({ forcedColors: 'none' })
   await cell(page).click()
   await page.keyboard.type('123')
   await cell(page)
      .locator('.candidate')
      .first()
      .evaluate((candidate) => candidate.classList.add('solved'))
   await page.emulateMedia({ media: 'print' })
   await expect(page.locator('html')).toHaveCSS('color-scheme', 'light')
   await expect(page.locator('.board-caption')).toHaveCSS('color', 'rgb(68, 68, 68)')
   await expect(page.locator('.tools')).toBeHidden()
   await expect(cell(page)).toHaveCSS('color', 'rgb(0, 0, 0)')
   await expect(cell(page).locator('.candidate.solved')).toHaveCSS('color', 'rgb(0, 0, 0)')
})

test('Step and Go retain focus for repeated Space activation', async ({ page }) => {
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   for (const name of ['step', 'go']) {
      const button = page.getByRole('button', { name, exact: true })
      await button.focus()
      for (let attempt = 0; attempt < 2; attempt++) {
         await page.keyboard.press('Space')
         await expect(button).toHaveAttribute('aria-disabled', 'false')
         await expect(button).toBeFocused()
      }
   }
})

test('puzzle actions stay available and columns stay stable across tabs', async ({ page }) => {
   await page.setViewportSize({ width: 1280, height: 600 })
   const before = await page.locator('.board-area').boundingBox()
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   for (const name of ['clear', 'import', 'export', 'undo']) {
      await expect(page.getByRole('button', { name, exact: true })).toBeVisible()
   }
   const after = await page.locator('.board-area').boundingBox()
   expect(Math.abs(before!.width - after!.width)).toBeLessThan(1)
   expect(Math.abs(before!.x - after!.x)).toBeLessThan(1)
   await page.getByRole('button', { name: 'export', exact: true }).click()
   await page.getByRole('button', { name: 'Close', exact: true }).click()
   await expect(page.getByRole('button', { name: 'export', exact: true })).toBeFocused()
})

test('selection made while the worker loads survives completion and accepts a fresh digit', async ({
   page
}) => {
   let release!: () => void
   let started!: () => void
   const gate = new Promise<void>((resolve) => {
      release = resolve
   })
   const requested = new Promise<void>((resolve) => {
      started = resolve
   })
   await page.route('**/solver.worker-*.js', async (route) => {
      started()
      await gate
      await route.continue()
   })
   try {
      await page.getByRole('tab', { name: 'strategies', exact: true }).click()
      await page.getByRole('button', { name: 'go', exact: true }).click()
      await requested
      await cell(page, 0, 1).click()
      release()
      await expect(page.getByRole('status')).toContainText('No more progress')
      await expect(cell(page, 0, 1)).toBeFocused()
      await expect(cell(page, 0, 1)).toHaveAttribute('data-active', 'true')
      await page.keyboard.type('7')
      await expect(visibleCandidates(page, 0, 1)).toHaveText('7')
   } finally {
      release()
   }
})

test('undo after changing strategy preferences runs newly enabled propagation', async ({
   page
}) => {
   await importPuzzle(page, '1' + '.'.repeat(80))
   await page.getByRole('tab', { name: 'strategies', exact: true }).click()
   const propagation = page.getByRole('switch', { name: 'Toggle Update candidates', exact: true })
   await propagation.uncheck()
   const step = page.getByRole('button', { name: 'step', exact: true })
   await step.click()
   await expect(step).toHaveAttribute('aria-disabled', 'false')
   await cell(page, 0, 1).click()
   await page.keyboard.type('2')
   await propagation.check()
   await page.getByRole('button', { name: 'undo', exact: true }).click()
   await page.getByRole('button', { name: 'go', exact: true }).click()
   await expect(page.getByLabel('Status for Update candidates', { exact: true })).toHaveText('20')
})
