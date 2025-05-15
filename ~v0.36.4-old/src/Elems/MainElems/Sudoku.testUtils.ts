import { screen } from '@testing-library/react';
import Cell from './Cell';
import { IndexToNine } from '../../Types';

export function getTableCellElement(row: IndexToNine, column: IndexToNine) {
   return getButtonCellElement(row, column).parentElement as HTMLElement
}

// The actual handler
export function getButtonCellElement(row: IndexToNine, column: IndexToNine) {
   return screen.getByRole('button', { name: Cell.labelAt(row, column) })
}
