import { render } from '@testing-library/react';
import React from 'react'

import Main from './Main'

render(<Main />)

describe('Main', () => {
   test('it exists', () => {
      expect(document.getElementsByClassName('App-main')).toHaveLength(1)
   })

   const mainElement = document.getElementsByClassName('App-main')[0]

   test('has 3 elements', () => {
      expect(mainElement.children).toHaveLength(3)
   })

   const [dataElement, sudokuElement, _coordsElement] = mainElement.children

   test.todo('more simple stuff')

   describe('functionality', () => {
      describe('cell changing', () => {
         // sudoku > tbody > row > cell
         const firstCell = sudokuElement.children[0].children[0].children[0] // implicit structure test

         function candidatesOf(cell) {
            return cell.innerText.replaceAll(/\n|\t/g, '')
         }

         // candidates in the textbox
         function displayedCandidates() {
            return document.getElementById('Data').value
         }

         test('candidates pop up when focused', () => {
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
            tryEvent(10); tryEvent(11); tryEvent(12); tryEvent(13);
            expect(candidatesOf(firstCell)).toBe('')
            expect(displayedCandidates()).toBe('empty!')

            firstCell.blur()
            expect(candidatesOf(firstCell)).toBe('0')
         })

         test('when a cell has 1 candidate', () => {
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
})
