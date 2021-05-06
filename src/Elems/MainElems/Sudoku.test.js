
import { render } from '@testing-library/react';

import Sudoku from './Sudoku'

const sudoku = <Sudoku />
render(sudoku)

test('the data callbacks were called / cells were processed', () => {
   expect(sudoku.data.flat(Infinity)).toHaveLength(64)
})
