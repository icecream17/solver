// import logo from './logo.svg'
import './App.css'
import React from 'react'

import Title from './Elems/Title'
import Version from './Elems/Version'
import Main from './Elems/Main'
import Aside from './Elems/Aside'

/**
 * The <App /> component
 * Stores the global "state.sudoku" property
 */
class App extends React.Component {
   constructor (props) {
      super(props)
      
      this.state = {
         sudoku: null
      }

      this.whenSudokuUpdates = this.whenSudokuUpdates.bind(this)
   }

   render() {
      return (
         <div className="App">
            <header className="App-header">
               <Title />
               <Version />
            </header>
            <Main whenSudokuUpdates={this.whenSudokuUpdates} />
            <Aside />
         </div>
      );
   }

   whenSudokuUpdates(sudoku) {
      this.state.sudoku = sudoku.data
   }
}

export default App
