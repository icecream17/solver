
import { render } from '@testing-library/react';

import Sudoku from './Sudoku'

// sudokuInstance !== sudokuElement
const sudoku = render(<Sudoku />)

test('is sudoku', () => {
   expect(sudoku).toBeInstanceOf(Sudoku)
})
