// import logo from './logo.svg'
import './App.css'
import React from 'react'

import Main from './Elems/Main'
import Aside from './Elems/Aside'
import SudokuData from './Api/Spaces/Sudoku'
import Solver from './Api/Solver'
import { AlertType, CouldAIsB, NoticeInfo, NoticeType, PromptCallback, SudokuDigits, _UnusedProps } from './Types'
import NoticeWindow from './Elems/NoticeElems/NoticeWindow'
import GithubCorner from './Elems/GithubCorner'
import Cell from './Elems/MainElems/Cell'
import Title from './Elems/Title'
import Version from './Elems/Version'

declare global {
   interface Window {
      _custom: {
         alert: typeof App.prototype.alert
         prompt: typeof App.prototype.prompt
      }
   }

   interface Set<T> {
      has (value: unknown): CouldAIsB<typeof value, T>
      delete (value: unknown): CouldAIsB<typeof value, T>
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars --- I can't prefix this with an underscore, _typescript_
   interface Map<K, V> {
      has (key: unknown): CouldAIsB<typeof key, K>
   }

   // eslint-disable-next-line @typescript-eslint/no-unused-vars --- I can't prefix this with an underscore, _typescript_
   interface Array<T> {
      slice(start?: number, end?: number): this
   }
}


type AppState = {
   notices: NoticeInfo[]
}

/**
 * The <App /> component
 * Stores the global "state.sudoku" property
 *
 * @example
 * <App />
 */
class App extends React.Component<_UnusedProps, AppState> {
   sudoku: SudokuData
   solver: Solver
   propsPassedDown: { whenCellMounts: (cell: Cell) => void; whenCellUnmounts: (cell: Cell) => void; whenCellUpdates: (cell: Cell, candidates: SudokuDigits[]) => void }
   constructor(props: _UnusedProps) {
      super(props)

      /**
       * Cells are added to the sudokudata as they are mounted
       * ```js
       * // In cell setup
       * callback()
       *
       * // Sudoku callback
       * this.data.updateFromCell(cell)
       * ```
       */
      this.sudoku = new SudokuData()
      this.solver = new Solver(this.sudoku)
      this.state = {
         /**
          * The queue of alert and prompt messages to be sent
          * Only 1 is displayed at a time
          */
         notices: []
      }

      this.whenCellMounts = this.whenCellMounts.bind(this)
      this.whenCellUnmounts = this.whenCellUnmounts.bind(this)
      this.whenCellUpdates = this.whenCellUpdates.bind(this)
      this.finishNotice = this.finishNotice.bind(this)
      this.propsPassedDown = {
         whenCellMounts: this.whenCellMounts,
         whenCellUnmounts: this.whenCellUnmounts,
         whenCellUpdates: this.whenCellUpdates,
      }
      window._custom = {
         alert: this.alert.bind(this),
         prompt: this.prompt.bind(this)
      }
   }

   componentWillUnmount () {
      window._custom.alert = () => undefined;
      window._custom.prompt = () => undefined;
   }

   render () {
      return (
         <div className="App">
            <header className="App-header">
               <Title />
               <Version />
            </header>
            <Main propsPassedDown={this.propsPassedDown} />
            <Aside sudoku={this.sudoku} solver={this.solver} />

            <GithubCorner />
            <NoticeWindow todo={this.state.notices} whenFinish={this.finishNotice} />
         </div>
      );
   }

   whenCellMounts (cell: Cell) {
      this.sudoku.addCell(cell)
   }

   whenCellUnmounts (cell: Cell) {
      this.sudoku.removeCell(cell)
   }

   whenCellUpdates (cell: Cell, candidates: SudokuDigits[]) {
      this.sudoku.data[cell.props.row][cell.props.column] = candidates
      this.solver.skippable.fill(false)
   }


   // The alert and prompt methods serve 2 purposes:
   // 1. User isn't absolutely blocked
   // 2. No more `not implemented` errors in tests

   alert (message: string, alertType = AlertType.INFO, cssCls = '') {
      this.setState(state => {
         return {
            notices: [...state.notices, {
               type: NoticeType.ALERT,
               alertType,
               message,
               cssCls
            }]
         }
      })
   }

   prompt (title: string, message = "this default message shouldn't appear", defaultResponse = "", callback?: PromptCallback, cssCls = '') {
      this.setState(state => {
         return {
            notices: [...state.notices, {
               type: NoticeType.PROMPT,
               title,
               message,
               defaultResponse,
               callback,
               cssCls
            }]
         }
      })
   }

   finishNotice () {
      this.setState(state => {
         const [, ...notices] = state.notices // Remove first notice
         return { notices }
      })
   }
}

export default App
