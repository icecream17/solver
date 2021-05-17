// import logo from './logo.svg'
import './App.css'
import React from 'react'

import Title from './Elems/Title'
import Version from './Elems/Version'
import Main from './Elems/Main'
import Aside from './Elems/Aside'
import Sudoku from './Elems/MainElems/Sudoku'

interface AppState {
   sudoku: null | typeof Sudoku.prototype.data,
   error: boolean
}

/**
 * The <App /> component
 * Stores the global "state.sudoku" property
 *
 * @example
 * <App />
 */
class App extends React.Component<any, AppState> {
   constructor (props: any) {
      super(props)

      this.state = {
         /**
          * See `sudoku.js`.
          * When none of the sudoku's cells are initialized,
          * the prop defaults to null
          *
          * @name Sudoku.state.sudoku
          * @default {null}
          */
         sudoku: null,
         error: false
      }

      this.whenSudokuConstructs = this.whenSudokuConstructs.bind(this)
   }

   componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
      this.setState({ error: true })
   }

   render() {
      let thisClass = "App"
      if (this.state.error) {
         thisClass += "error"
      }
      return (
         <div className={thisClass}>
            <header className="App-header">
               <Title />
               <Version />
            </header>
            <Main whenSudokuConstructs={this.whenSudokuConstructs} />
            <Aside sudoku={this.state.sudoku} />
         </div>
      );
   }

   whenSudokuConstructs(sudoku: Sudoku) {
      // Only have to set once, since Arrays are "reference like". Lol
      this.setState({ sudoku: sudoku.data })
   }
}

export default App
