
import React from 'react';

import './Sudoku.css'
import Row from './Row';

/**
 * The main sudoku!!!!
 * No setup required!
 *
 * @example
 * <Sudoku />
 */
export default class Sudoku extends React.Component {
   render() {
      return (
         <table className='Sudoku'>
            <tbody>
               <Row index={0} />
               <Row index={1} />
               <Row index={2} />
               <Row index={3} />
               <Row index={4} />
               <Row index={5} />
               <Row index={6} />
               <Row index={7} />
               <Row index={8} />
            </tbody>
         </table>
      )
   }
}
