/**
 * a11y conformance tests
 * https://w3c.github.io/aria-practices/#keyboard-interaction-21
 */

import { render, screen } from '@testing-library/react';
import Aside from "../Aside";
import Sudoku from '../../Api/Spaces/Sudoku';
import userEvent from '@testing-library/user-event';
import { switchTab } from '../../testUtils';

beforeEach(() => {
   render(
      <div>
         <textarea data-testid="dummy-focusable"></textarea>
         <Aside sudoku={new Sudoku()} />
      </div>
   );
})

test('Tab: When focus moves into the tab list, focus on the active tab element', () => {
   const dummyTextarea = screen.getByTestId("dummy-focusable")
   const stratsTab = screen.getByRole("tab", { name: "strats" })
   userEvent.click(stratsTab)
   dummyTextarea.focus()
   userEvent.tab()
   expect(stratsTab).toHaveFocus()
})

// Note: Saved by luck; tab doesn't actually check if the first meaningful element is focusable
// Note: I'm not sure if there's somewhat wrong with tab. TODO
test.skip('Tab: When in the tab list, focus on the tabpanel unless the first meaningful element is focusable', () => {
   switchTab('strats')
   userEvent.tab()
   expect(screen.getByRole("button", { name: "clear" })).toHaveFocus()
})

test.skip('Left / Right arrow keys', () => {
   const solveToolsTab = screen.getByRole("tab", { name: "solving tools" })
   const stratsTab = screen.getByRole("tab", { name: "strats" })

   userEvent.click(stratsTab)
   userEvent.keyboard('{ArrowLeft}')
   expect(solveToolsTab).toHaveFocus()
   userEvent.keyboard('{ArrowLeft}')
   expect(stratsTab).toHaveFocus()
   userEvent.keyboard('{ArrowRight}')
   expect(solveToolsTab).toHaveFocus()
   userEvent.keyboard('{ArrowRight}')
   expect(stratsTab).toHaveFocus()
})

// Space or Enter --> Activates tab if not activated automatically on focus
// Shift+F10 --> If the tab has an associated popup menu, opens the menu
// Delete --> If deletion is allowed....

test('Home / End', () => {
   const solveToolsTab = screen.getByRole("tab", { name: "solving tools" })
   const stratsTab = screen.getByRole("tab", { name: "strats" })

   userEvent.click(stratsTab)
   userEvent.keyboard('{Home}')
   expect(solveToolsTab).toHaveFocus()
   userEvent.keyboard('{End}')
   expect(stratsTab).toHaveFocus()
})
