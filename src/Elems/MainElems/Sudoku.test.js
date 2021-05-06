
import { render } from '@testing-library/react';

import Sudoku from './Sudoku'

// sudokuInstance !== sudokuElement
const sudoku = render(<Sudoku />)

test('the data callbacks were called / cells were processed', () => {
   expect(sudoku.data.flat(Infinity)).toHaveLength(64)
})
