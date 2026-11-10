import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { keysPressed } from '../../keyboardListener';
import { switchTab } from '../../testUtils';
import { forComponentsToUpdate } from '../../utils';
import { getButtonCellElement } from './Sudoku.testUtils';

const errorAttribute = 'data-error'

beforeEach(() => {
   keysPressed.clear() // Match Sudoku.test.tsx: held keys otherwise survive between tests.
})

test.each([
   ['an untouched cell', ''],
   ['a cell explicitly emptied of candidates', '{Control>}{Backspace}{/Control}'],
])('first entry, Undo, and the next digit in %s', async (_description, preparation) => {
   render(<App />)
   switchTab('strategies')
   const cell = getButtonCellElement(0, 0)
   userEvent.click(cell)
   userEvent.keyboard(`${preparation}1`)
   expect(cell).toHaveTextContent(/^1$/)
   expect(cell).not.toHaveAttribute(errorAttribute)

   // Current React Undo has no manual-edit history: this entry stays in place.
   const undo = screen.getByRole('button', { name: 'undo' })
   userEvent.click(undo)
   await act(forComponentsToUpdate)
   expect(undo).toHaveFocus()
   expect(cell).toHaveTextContent(/^1$/)

   userEvent.click(cell)
   userEvent.keyboard('2')
   expect(cell).toHaveFocus()
   expect(cell).toHaveTextContent(/^12$/)
})

test.each(['click', 'arrow keys'])('leaving and returning by %s retains narrowed candidates', movement => {
   render(<App />)
   const first = getButtonCellElement(0, 0)
   const second = getButtonCellElement(0, 1)
   userEvent.click(first)
   userEvent.keyboard('1')

   if (movement === 'click') {
      userEvent.click(second)
   } else {
      userEvent.keyboard('{ArrowRight}')
   }
   expect(second).toHaveFocus()
   userEvent.keyboard('2')
   expect(first).toHaveTextContent(/^1$/)
   expect(second).toHaveTextContent(/^2$/)

   if (movement === 'click') {
      userEvent.click(first)
   } else {
      userEvent.keyboard('{ArrowLeft}')
   }
   expect(first).toHaveFocus()
   userEvent.keyboard('3')
   expect(first).toHaveTextContent(/^13$/)
   expect(second).toHaveTextContent(/^2$/)
})

test('explicitly reaching all nine candidates makes the next digit a fresh entry', () => {
   render(<App />)
   const cell = getButtonCellElement(0, 0)
   userEvent.click(cell)
   userEvent.keyboard('12345678')
   expect(cell).toHaveTextContent(/^12345678$/)
   userEvent.keyboard('9')
   expect(cell).toHaveTextContent(/^123456789$/)

   // React derives fresh-entry state from candidate count even within one selection.
   userEvent.keyboard('4')
   expect(cell).toHaveTextContent(/^4$/)
   userEvent.keyboard('4')
   expect(cell).toHaveTextContent(/^$/)
   expect(cell).toHaveAttribute(errorAttribute, 'true')
   userEvent.keyboard('5')
   expect(cell).toHaveTextContent(/^5$/)
   expect(cell).not.toHaveAttribute(errorAttribute)
})

test.each(['Backspace', 'Delete', 'Clear'])('%s resets entry while its Shift combination empties candidates', key => {
   render(<App />)
   const cell = getButtonCellElement(0, 0)
   userEvent.click(cell)
   userEvent.keyboard('12')
   expect(cell).toHaveTextContent(/^12$/)
   userEvent.keyboard(`{${key}}`)
   expect(cell).toHaveTextContent(/^123456789$/)
   userEvent.keyboard('3')
   expect(cell).toHaveTextContent(/^3$/)

   userEvent.keyboard(`{Shift>}{${key}}{/Shift}`)
   expect(cell).toHaveTextContent(/^$/)
   expect(cell).toHaveAttribute(errorAttribute, 'true')
   userEvent.keyboard('45')
   expect(cell).toHaveTextContent(/^45$/)
   expect(cell).not.toHaveAttribute(errorAttribute)
})

test('a multiple-cell edit uses each cell\'s fresh-entry state', () => {
   render(<App />)
   const narrowed = getButtonCellElement(0, 0)
   const fresh = getButtonCellElement(0, 1)
   userEvent.click(narrowed)
   userEvent.keyboard('12{Control>}')
   userEvent.click(fresh)
   userEvent.keyboard('{/Control}3')
   expect(narrowed).toHaveTextContent(/^123$/)
   expect(fresh).toHaveTextContent(/^3$/)

   userEvent.keyboard('3')
   expect(narrowed).toHaveTextContent(/^12$/)
   expect(fresh).toHaveTextContent(/^$/)
   expect(fresh).toHaveAttribute(errorAttribute, 'true')
})
