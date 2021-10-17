
import React from 'react';
import { IndexToNine, _ReactProps } from '../../Types';

import Cell, { BaseCellProps } from './Cell';


type RowProps = Readonly<{
   index: IndexToNine
   propsPassedDown: Omit<BaseCellProps, "row" | "column">
}> & _ReactProps

/**
 * A row in a sudoku
 *
 * @example
 * <Row index={3} />
 */
export default class Row extends React.Component<RowProps> {
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
