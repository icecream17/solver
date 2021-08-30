import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sudoku from '../Api/Spaces/Sudoku';
import Aside from './Aside';

beforeEach(() => {
   render(<Aside sudoku={new Sudoku()} />);
})

function getTogglers () {
   try {
      return screen.getAllByRole('checkbox')
   } catch (error) {
      if (error instanceof Error && error.name === "TestingLibraryElementError") {
         return screen.getAllByRole('switch')
      } else {
         throw error
      }
   }
}

test('has accessible role', () => {
   getTogglers()
   expect(true).toBe(true)
})

test('the togglers toggle the strategy item', () => {
   // The listItem is the parent of a label.
   // Remember that the checkbox has a label.
   const someCheckbox = getTogglers()[0]
   const listItem = (someCheckbox.parentElement as HTMLElement).parentElement as HTMLElement

   expect(listItem).not.toBeNull()

   // Initially checked
   expect(someCheckbox).toBeChecked()
   expect(listItem).not.toHaveClass('disabled')

   userEvent.click(someCheckbox)
   expect(someCheckbox).not.toBeChecked()
   expect(listItem).toHaveClass('disabled')

   userEvent.click(someCheckbox)
   expect(someCheckbox).toBeChecked()
   expect(listItem).not.toHaveClass('disabled')
})
