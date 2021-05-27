
import React from 'react';
import Sudoku from './Sudoku';
import { IndexToNine, _ReactProps } from '../../Types';

import Cell from './Cell';
import { _expect } from '../../utils';

type RowProps = Readonly<{
   index: IndexToNine,
   parent: Sudoku,
   whenCellConstructs(...args: any): any
}> & _ReactProps

/**
 * A row in a sudoku
 *
 * @example
 * <Row index={3} />
 *
 * @requiredProps
 * - index
 * - whenCellConstructs
 */
export default class Row extends React.Component<RowProps> {
   constructor(props: RowProps) {
      _expect(Row, props).toHaveProperties('index', 'whenCellConstructs', 'parent')
      super(props)
   }

   render() {
      const propsPassedDown = {
         row: this.props.index,
         sudoku: this.props.parent,
         whenConstruct: this.props.whenCellConstructs
      } as const

      return (
         <tr className='Row'>
            <Cell column={0} {...propsPassedDown} />
            <Cell column={1} {...propsPassedDown} />
            <Cell column={2} {...propsPassedDown} />
            <Cell column={3} {...propsPassedDown} />
            <Cell column={4} {...propsPassedDown} />
            <Cell column={5} {...propsPassedDown} />
            <Cell column={6} {...propsPassedDown} />
            <Cell column={7} {...propsPassedDown} />
            <Cell column={8} {...propsPassedDown} />
         </tr>
      )
   }
}
