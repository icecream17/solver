
import './StrategyList.css'
import React from 'react';
import Solver from '../../Api/Solver';
import { _expect } from '../../utils';
import { GuaranteedConstructCallback } from '../../Types';
import StrategyItem from './StrategyItem';

type StrategyListProps = Readonly<{
   solver: Solver
}> & GuaranteedConstructCallback

/**
 * A list of strategies
 *
 * @requiredProps
 * - solver
 */
export default class StrategyList extends React.Component<StrategyListProps> {
   constructor(props: StrategyListProps) {
      _expect(StrategyList, props).toHaveProperties("solver")

      super(props)
   }

   render() {
      let index = 0
      function getIndex () {
         return index++
      }

      const getRepeatedProps = () => {
         return {
            solver: this.props.solver,
            index: getIndex()
         }
      }

      return (
         <ol className='StrategyList' id='StrategyList'>
            <StrategyItem
               name='Check for solved'
               required='true'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Update candidates'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Hidden singles'
               href='https://www.sudokuwiki.org/Getting_Started'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Pairs, triples, and quads'
               href='https://www.sudokuwiki.org/Naked_Candidates'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Hidden pairs, triples, and quads'
               href='https://www.sudokuwiki.org/Hidden_Candidates'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Intersection removal'
               href='https://www.sudokuwiki.org/Intersection_Removal'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='X wing'
               href='https://www.sudokuwiki.org/X_Wing_Strategy'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Swordfish'
               href='https://www.sudokuwiki.org/Sword_Fish_Strategy'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Jellyfish'
               href='https://www.sudokuwiki.org/Jelly_Fish_Strategy'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Skyscraper'
               {...getRepeatedProps()}
            />
         </ol>
      )
   }
}
