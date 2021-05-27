import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import Cell from './Elems/MainElems/Cell';
import { IndexToNine, SudokuDigits } from './Types';
import { forComponentsToUpdate } from './utils';

beforeEach(() => {
   render(<App />);
})

test('it renders', () => {
   expect(true).toBe(true)
})

// Explicit implicit checks //
test('getting the main element', () => {
   expect(screen.getByRole('main')).toBeInTheDocument()
})

test('a header exists', () => {
   expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
})

// The name === 'Sudoku' because aria-label === 'Sudoku'
test('getting the sudoku table', () => {
   expect(screen.getByRole('table', { name: 'Sudoku' })).toBeInTheDocument()
})

function getSudokuTableElement () {
   return screen.getByRole('table', { name: 'Sudoku' })
}

function getTableCellElement (row: IndexToNine, column: IndexToNine) {
   return getButtonCellElement(row, column).parentElement as HTMLElement
}

// The actual handler
function getButtonCellElement(row: IndexToNine, column: IndexToNine) {
   return screen.getByRole('button', { name: Cell.labelAt(row, column) })
}

const cellTests = [
   [0, 0],
   [0, 1],
   [1, 1],
   [1, 2],
   [5, 0],
   [8, 7],
   [3, 4],
   [6, 2],
   [4, 5]
] as const

test.each(cellTests)('getting the cell at row %i, column %i', (row, column) => {
   expect(getTableCellElement(row, column)).toBeInTheDocument()
   expect(getButtonCellElement(row, column)).toBeInTheDocument()
})

// If the way the buttonCell is highlighted is changed, update this test
// Right now it's by data-active
test("Focused buttonCells are highlighted", () => {
   const buttonCell = getButtonCellElement(0, 0)
   expect(buttonCell).not.toHaveAttribute('data-active')
   userEvent.click(buttonCell)
   expect(buttonCell).toHaveAttribute('data-active')
   fireEvent.blur(buttonCell)
   expect(buttonCell).not.toHaveAttribute('data-active')
})

test("Setting a cell to a digit", () => {
   const buttonCell = getButtonCellElement(0, 0)
   userEvent.click(buttonCell)
   userEvent.keyboard('1')
   expect(buttonCell).toHaveTextContent('1')
})

test("Setting a cell to multiple candidates", () => {
   const buttonCell = getButtonCellElement(0, 0)
   userEvent.click(buttonCell)
   userEvent.keyboard('1234567')
   expect(buttonCell).toHaveTextContent('1234567')
})

test("Clearing all candidates of a cell", () => {
   const buttonCell = getButtonCellElement(0, 0)
   userEvent.click(buttonCell)
   userEvent.keyboard('{Backspace}')
   fireEvent.blur(buttonCell)

   // Shows 0
   expect(buttonCell).toHaveTextContent('0')

   // Is error
   expect(buttonCell).toHaveAttribute('data-error')
})

test("Resetting the candidates", () => {
   const buttonCell = getButtonCellElement(0, 0)
   userEvent.click(buttonCell)
   userEvent.keyboard('{Backspace}123') // 123 to prevent false negatives if backspace doesn't work
   userEvent.keyboard('{Shift>}{Backspace}{/Shift}')
   fireEvent.blur(buttonCell)

   // Is not error
   expect(buttonCell).not.toHaveAttribute('data-error')

   userEvent.click(buttonCell)
   userEvent.keyboard('{Shift>}{Backspace}{/Shift}')
   userEvent.keyboard('123')
   fireEvent.blur(buttonCell)

   expect(buttonCell).toHaveTextContent('456789')
})

test.skip("Cell keyboard navigation", () => {
   const cornerCell = getButtonCellElement(0, 7)
   userEvent.click(cornerCell)

   function tryKey(keyboard: string, row: IndexToNine, column: IndexToNine) {
      userEvent.keyboard(keyboard)
      expect(getButtonCellElement(row, column)).toHaveFocus()
   }

   tryKey('{Tab}', 1, 7)
   tryKey('{ArrowLeft}', 0, 7)
   tryKey('{ArrowLeft}', 7, 7)
   tryKey('{ArrowDown}', 7, 0)
   tryKey('{ArrowRight}', 0, 0)
   tryKey('{ArrowUp}', 0, 7)
   tryKey('{Tab}', 1, 7)
})

function setCell (x: IndexToNine, y: IndexToNine) {
   return {
      to(...candidates: SudokuDigits[]) {
         const cell = getButtonCellElement(x, y)
         userEvent.click(cell)
         userEvent.keyboard(candidates.join(''))
         fireEvent.blur(cell)
      }
   }
}

test("Strategy sections exist", () => {
   expect(screen.getByRole('group', { name: 'strategies' })).toBeInTheDocument()
   expect(screen.getByRole('group', { name: 'controls' })).toBeInTheDocument()
})

// How much each strategy control updates
enum StrategyControlUpdates {
   go = 30, // For now there aren't many strategies
   step = 20,
   clear = 2,
}

async function clickStrategyControl(name: keyof typeof StrategyControlUpdates) {
   userEvent.click(screen.getByRole('button', { name }))

   // Makes sure components are updated when control returns back
   for (let i = 0; i < StrategyControlUpdates[name]; i++) {
      await forComponentsToUpdate()
   }
}

// This test fails with "SolverThatWorksButFailsTests.ts.txt"
test("Strategy controls don't crash", () => {
   expect((async () => {
      await clickStrategyControl('go')
      await clickStrategyControl('step')

      setCell(7, 5).to(4)
      await clickStrategyControl('step')
      await clickStrategyControl('step')
      await clickStrategyControl('step')
      await clickStrategyControl('go')
      await clickStrategyControl('clear')

      return "success"
   })()).resolves.toBe("success")
})

async function canSolve() {
   screen.debug()
   function getSudokuTextContent () {
      return getSudokuTableElement().textContent ?? ''
   }

   const oldAlert = window.alert
   window.alert = jest.fn(console.error)

   let previousText;
   let intervals = 0;
   do {
      previousText = getSudokuTextContent()
      await clickStrategyControl('go')
      intervals++;
   } while (previousText !== getSudokuTextContent())

   const remainingText = getSudokuTextContent().replaceAll(/[^0-9]/g, '')
   if (remainingText.length === 81 && remainingText.includes('0') === false) {
      return true // Possible false positive
   }

   window.alert = oldAlert
   console.debug(intervals, remainingText)
   return false
}

// Sudoku credits: https://www.google.com/search?surl=1&q=easy+sudoku&rlz=1CANEHU_enUS924&sxsrf=ALeKk03VgFfCwAzr0-mdFU4XivSXkJzEDw:1621949007815&source=lnms&tbm=isch&sa=X&ved=2ahUKEwiA_dDz9uTwAhWNuJ4KHWz2CYkQ_AUoAXoECAEQAw&safe=active&ssui=on#imgrc=7-hGALfWmhmFJM
// Better link: https://images.app.goo.gl/WwGo8iVk84awRgnC9
// Actual website: https://www.puzzles.ca/sudoku_puzzles/sudoku_easy_481.html
//    (scroll down to #482)

// BUG: #9 "Go" is different from clicking "Step" multiple times
test("Can solve a very simple sudoku", async () => {
   setCell(0, 0).to(6)
   setCell(0, 2).to(9)
   setCell(0, 5).to(4)
   setCell(0, 8).to(1)
   setCell(1, 0).to(8)
   setCell(1, 4).to(5)
   setCell(2, 1).to(3)
   setCell(2, 2).to(5)
   setCell(2, 3).to(1)
   setCell(2, 5).to(9)
   setCell(2, 8).to(8) // 11

   setCell(3, 2).to(8)
   setCell(3, 8).to(4)
   setCell(4, 1).to(5)
   setCell(4, 7).to(7)
   setCell(5, 0).to(4)
   setCell(5, 4).to(7)
   setCell(5, 7).to(5)
   setCell(5, 8).to(2) // 19

   setCell(6, 5).to(1)
   setCell(7, 2).to(1)
   setCell(7, 4).to(4)
   setCell(8, 0).to(7)
   setCell(8, 1).to(6)
   setCell(8, 3).to(9)
   setCell(8, 4).to(3) // 26
   await expect(canSolve()).resolves.toBe(true)
})
