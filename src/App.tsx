// import logo from './logo.svg'
import './App.css'
import React from 'react'

import Title from './Elems/Title'
import Version from './Elems/Version'
import Main from './Elems/Main'
import Aside from './Elems/Aside'
import Sudoku from './Elems/MainElems/Sudoku'
import { NoticeInfo, NoticeType, PromptCallback, _UnusedProps } from './Types'
import NoticeWindow from './Elems/NoticeElems/NoticeWindow'

declare global {
   interface Window {
      _custom: {
         alert: typeof App.prototype.alert
         prompt: typeof App.prototype.prompt
      }
   }
}


type AppState = {
   sudoku: null | typeof Sudoku.prototype.data,
   error: boolean,
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
   constructor (props: _UnusedProps) {
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
         error: false,
         notices: []
      }

      this.whenSudokuConstructs = this.whenSudokuConstructs.bind(this)
      this.finishNotice = this.finishNotice.bind(this)
      window._custom = {
         alert: this.alert.bind(this),
         prompt: this.prompt.bind(this)
      }
   }

   componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
      this.setState({ error: true })
   }

   render() {
      const classNames = ["App"]
      if (this.state.error) {
         classNames.push("error")
      }

      return (
         <div className={classNames.join(' ')}>
            <header className="App-header">
               <Title />
               <Version />
            </header>
            <Main whenSudokuConstructs={this.whenSudokuConstructs} />
            <Aside sudoku={this.state.sudoku} />
            <NoticeWindow todo={this.state.notices} finish={this.finishNotice} />
         </div>
      );
   }

   whenSudokuConstructs(sudoku: Sudoku) {
      // Only have to set once, since Arrays are "reference like". Lol
      this.setState({ sudoku: sudoku.data })
   }


   // These methods serve 2 purposes:
   // 1. User isn't absolutely blcked
   // 2. No more `not implemented` errors in tests

   alert(message: string) {
      this.setState(state => {
         const notices = state.notices.slice()
         notices.push({
            type: NoticeType.ALERT,
            message
         })

         return { notices }
      })
   }

   prompt(message = "default message (shouldn't appear)", defaultResponse = "", callback?: PromptCallback) {
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

   finishNotice() {
      this.setState(state => {
         const notices = state.notices.slice()
         notices.shift()
         return { notices }
      })
   }
}

export default App
