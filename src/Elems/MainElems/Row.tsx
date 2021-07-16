
import React from 'react';
import Sudoku from './Sudoku';
import { IndexToNine, _Function, _ReactProps } from '../../Types';

import Cell from './Cell';
import { _expect } from '../../utils';

type RowProps = Readonly<{
   index: IndexToNine
   parent: Sudoku
   whenCellMounts: _Function
   whenCellUnmounts: _Function
}> & _ReactProps

/**
 * A row in a sudoku
 *
 * @example
 * <Row index={3} />
 *
 * @requiredProps
 * - index
 * - whenCellMounts
 * - whenCellUnmounts
 */
export default class Row extends React.Component<RowProps> {
   constructor(props: RowProps) {
      _expect(Row, props).toHaveProperties('index', 'whenCellMounts', 'whenCellUnmounts', 'parent')
      super(props)
   }

   render() {
      const propsPassedDown = {
         row: this.props.index,
         sudoku: this.props.parent,
         whenCellMounts: this.props.whenCellMounts,
         whenCellUnmounts: this.props.whenCellUnmounts,
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
