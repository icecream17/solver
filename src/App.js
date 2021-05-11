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
         /**
          * See `sudoku.js`.
          * When none of the sudoku's cells are initialized,
          * the prop defaults to null
          *
          * @name Sudoku.state.sudoku
          * @type {null | Cell[][]}
          * @default {null}
          */
         sudoku: null
      }

      this.whenSudokuConstructs = this.whenSudokuConstructs.bind(this)
   }

   render() {
      return (
         <div className="App">
            <header className="App-header">
               <Title />
               <Version />
            </header>
            <Main whenSudokuConstructs={this.whenSudokuConstructs} />
            <Aside sudoku={this.state.sudoku} />
         </div>
      );
   }

   whenSudokuConstructs(sudoku) {
      // Only have to set once, since Arrays are "reference like". Lol
      this.setState({ sudoku: sudoku.data })
   }
}

export default App
