// import logo from './logo.svg'
import './App.css'
import React from 'react'

import Title from './Elems/Title'
import Version from './Elems/Version'
import Main from './Elems/Main'
import Aside from './Elems/Aside'
import SudokuData from './Api/Spaces/Sudoku'
import { AlertType, NoticeInfo, NoticeType, PromptCallback, SudokuDigits, _UnusedProps } from './Types'
import NoticeWindow from './Elems/NoticeElems/NoticeWindow'
import GithubCorner from './Elems/GithubCorner'
import Cell from './Elems/MainElems/Cell'

declare global {
   interface Window {
      _custom: {
         alert: typeof App.prototype.alert
         prompt: typeof App.prototype.prompt
      }
   }
}


type AppState = {
   error: boolean
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
      this.state = {
         /**
          * If the App has caught an error
          */
         error: false,

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
      window._custom = {
         alert: this.alert.bind(this),
         prompt: this.prompt.bind(this)
      }
   }

   componentWillUnmount () {
      window._custom.alert = () => undefined;
      window._custom.prompt = () => undefined;
   }

   componentDidCatch (error: Error, errorInfo: React.ErrorInfo) {
      console.error("App crashed", { error, errorInfo });
      this.setState({ error: true })
   }

   render () {
      const classNames = ["App"]
      if (this.state.error) {
         classNames.push("error")
      }

      const propsPassedDown = {
         whenCellMounts: this.whenCellMounts,
         whenCellUnmounts: this.whenCellUnmounts,
         whenCellUpdates: this.whenCellUpdates,
      }

      return (
         <div className={classNames.join(' ')}>
            <header className="App-header">
               <Title />
               <Version />
            </header>
            <Main propsPassedDown={propsPassedDown} />
            <Aside sudoku={this.sudoku} />

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
   }


   // The alert and prompt methods serve 2 purposes:
   // 1. User isn't absolutely blocked
   // 2. No more `not implemented` errors in tests

   alert (message: string, alertType = AlertType.INFO) {
      this.setState(state => {
         const notices = state.notices.slice()
         notices.push({
            type: NoticeType.ALERT,
            alertType,
            message
         })

         return { notices }
      })
   }

   prompt (message = "default message (shouldn't appear)", defaultResponse = "", callback?: PromptCallback) {
      this.setState(state => {
         const notices = state.notices.slice()
         notices.push({
            type: NoticeType.PROMPT,
            message,
            defaultResponse,
            callback
         })

         return { notices }
      })
   }

   finishNotice () {
      this.setState(state => {
         const notices = state.notices.slice()
         notices.shift()
         return { notices }
      })
   }
}

export default App
