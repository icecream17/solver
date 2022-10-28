
import './StrategyList.css'
import React from 'react';
import Solver from '../../Api/Solver';
import { GuaranteedConstructCallback } from '../../Types';
import StrategyItem from './StrategyItem';

type StrategyListProps = Readonly<{
   solver: Solver
}> & GuaranteedConstructCallback

/**
 * A list of strategies
 */
export default class StrategyList extends React.Component<StrategyListProps> {
   constructor(props: StrategyListProps) {
      super(props)
      this.props.whenConstruct()
   }

   render() {
      let index = 0

      const getRepeatedProps = () => {
         return {
            solver: this.props.solver,
            index: index++
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
               name='Intersection removal'
               href='https://www.sudokuwiki.org/Intersection_Removal'
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
               href='https://www.sudopedia.org/wiki/Skyscraper'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Two string kite'
               href='https://www.sudopedia.org/wiki/2-String_Kite'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Y wing (aka Bent triple)'
               href='https://www.sudokuwiki.org/Y_Wing_Strategy'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='Two minus one lines'
               href='https://github.com/icecream17/solver/blob/main/Strategies.md#two-minus-one-lines'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='W wing'
               href='http://sudopedia.enjoysudoku.com/W-Wing.html'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='XYZ wing'
               href='http://hodoku.sourceforge.net/en/tech_wings.php#xyz'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='XY Ring (Loop)'
               href='https://youtu.be/OUKwjVs4MsY'
               {...getRepeatedProps()}
            />
            <StrategyItem
               name='XY Chain'
               href='https://www.sudokuwiki.org/XY_Chains'
               {...getRepeatedProps()}
            />
         </ol>
      )
   }
}
