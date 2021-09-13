
import React from 'react';
import { IndexToNine, _ReactProps } from '../../Types';

import Cell, { BaseCellProps } from './Cell';
import { _expect } from '../../utils';


type RowProps = Readonly<{
   index: IndexToNine
   propsPassedDown: Omit<BaseCellProps, "row" | "column">
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
      _expect(Row, props).toHaveProperties('index', 'propsPassedDown')
      super(props)
   }

   render() {
      const propsPassedDown = {
         row: this.props.index,
         ...(this.props.propsPassedDown)
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
