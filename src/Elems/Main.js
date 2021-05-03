import './Main.css'
import React from 'react'

import Sudoku from './MainElems/Sudoku'
import Data from './MainElems/Data';
import Coords from './MainElems/Coords';

function Main() {
   return (
      <main className="App-main">
         <Data id="Data" />
         <Sudoku />
         <Coords />
      </main>
   );
}

export default Main
