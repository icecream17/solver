
import React from 'react';
import Sudoku from './Sudoku';
import { IndexToNine } from '../../Types';

import Cell from './Cell';

type RowProps = Readonly<{
   index: IndexToNine,
   parent: Sudoku,
   whenCellConstructs(...args: any): any
} & typeof React.Component.prototype.props>

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
export default class Row extends React.Component {
   props!: RowProps
   constructor(props: RowProps) {
      for (const requiredProp of ['index', 'whenCellConstructs', 'parent'] as const) {
         if (!(requiredProp in props)) {
            throw TypeError(`Row: Required property ${requiredProp} is missing`)
         }
      }

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
