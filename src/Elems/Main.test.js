import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event'
import React from 'react'

import Main from './Main'

render(<Main />)

test.todo('more tests')

const mainElement = document.getElementsByClassName('App-main')?.[0]
const dataElement = mainElement?.children?.[0]
const sudokuElement = mainElement?.children?.[1]

if (!(mainElement && dataElement && sudokuElement)) {
   screen.debug()
}

test('mainElement exists', () => {
   expect(document.getElementsByClassName('App-main')).toHaveLength(1)
})

test('and has 3 children', () => {
   expect(mainElement.children).toHaveLength(3)
})

test('dataElement.id === "Data"', () => {
   expect(dataElement.id).toBe("Data")
})

describe.skip('functionality', () => {
   describe('cell changing', () => {
      function getCell (x, y) {
         // sudoku > tbody > row > cell
         sudokuElement.children[0].children[x].children[y] // implicit structure test
      }

      function candidatesOf(cell) {
         return cell.innerText.replaceAll(/\n|\t/g, '')
      }

      // candidates in the textbox
      function displayedCandidates() {
         return document.getElementById('Data').value
      }

      test('candidates pop up when focused', () => {
         const firstCell = getCell(0, 0)

         expect(() => firstCell.focus()).not.toThrow()
         expect(candidatesOf(firstCell)).toBe('123456789')
      })

      // Implicit .not.toThrow for all keypress events
      const keypressEvents = [
         new KeyboardEvent('keypress'),
         new KeyboardEvent('keypress', { key: '7' }),
         new KeyboardEvent('keypress', { key: '3' }),
         new KeyboardEvent('keypress', { key: '1' }),
         new KeyboardEvent('keypress', { key: '4' }),
         new KeyboardEvent('keypress', { key: '2' }),

         new KeyboardEvent('keypress', { key: '6' }),
         new KeyboardEvent('keypress', { key: '5' }),
         new KeyboardEvent('keypress', { key: '3' }),
         new KeyboardEvent('keypress', { key: '5' }),
         new KeyboardEvent('keypress', { key: '3' }),

         new KeyboardEvent('keypress', { key: '5' }),
         new KeyboardEvent('keypress', { key: '8' }),
         new KeyboardEvent('keypress', { key: '9' }),
         new KeyboardEvent('keypress', { key: '4' }),
      ]

      function tryEvent(index) {
         firstCell.dispatchEvent(keypressEvents[index])
      }

      test('candidates are toggled on keypress & textarea is updated', () => {
         const firstCell = getCell(0, 0)

         tryEvent(0);
         expect(candidatesOf(firstCell)).toBe('123456789')
         expect(displayedCandidates()).toBe('123456789')

         tryEvent(1);
         expect(candidatesOf(firstCell)).toBe('12345689')
         expect(displayedCandidates()).toBe('89')

         tryEvent(2); tryEvent(3); tryEvent(4);
         tryEvent(5); tryEvent(6); tryEvent(7);
         expect(candidatesOf(firstCell)).toBe('89')
         expect(displayedCandidates()).toBe('89')

         tryEvent(8); tryEvent(9);
         expect(candidatesOf(firstCell)).toBe('8935')
         expect(displayedCandidates()).toBe('8935')
      })

      test('when a cell is empty', () => {
         const firstCell = getCell(0, 0)

         tryEvent(10); tryEvent(11); tryEvent(12); tryEvent(13);
         expect(candidatesOf(firstCell)).toBe('')
         expect(displayedCandidates()).toBe('empty!')

         firstCell.blur()
         expect(candidatesOf(firstCell)).toBe('0')
      })

      test('when a cell has 1 candidate', () => {
         const firstCell = getCell(0, 0)

         firstCell.focus()
         tryEvent(14);
         expect(candidatesOf(firstCell)).toBe('4')
         expect(displayedCandidates()).toBe('4')

         firstCell.blur()
         expect(firstCell.innerText).toBe('4') // No table!

         firstCell.focus()
         expect(firstCell.innerText).not.toBe('4') // Candidate table!
      })
   })

})
