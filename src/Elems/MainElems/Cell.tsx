// @flow

import React, { Suspense } from 'react';
import { _expect } from '../../utils';
import { IndexToNine, Mutable, SudokuDigits, ZeroToNine, _Callback } from '../../Types';

const Candidates = React.lazy(() => import('./Candidates'));
const CandidatesDiff = React.lazy(() => import('./CandidatesDiff'));

// Maps keys to coords
export const keyboardMappings = {
   'ArrowUp': { vRow: -1, vColumn: 0 },
   'KeyW': { vRow: -1, vColumn: 0 },
   'ArrowLeft': { vRow: 0, vColumn: -1 },
   'KeyA': { vRow: 0, vColumn: -1 },
   'ArrowDown': { vRow: 1, vColumn: 0 },
   'KeyS': { vRow: 1, vColumn: 0 },
   'ArrowRight': { vRow: 0, vColumn: 1 },
   'KeyD': { vRow: 0, vColumn: 1 },
}

export type BaseCellProps = Readonly<{
   row: IndexToNine
   column: IndexToNine

   whenNewCandidates: (cell: Cell, candidates: SudokuDigits[]) => void
   whenCellKeydown: (cell: Cell, event: React.KeyboardEvent) => void

   whenCellMounts: _Callback
   whenCellUnmounts: _Callback
}>

type CellProps = BaseCellProps

type CellState = Readonly<(
   {
      candidates: SudokuDigits[]
      showCandidates: boolean
      error: boolean
   } & (
      {
         active: false
         pretend: false
      } |
      {
         active: true
         pretend: boolean
      }
   ) & (
      {
         explaining: true
         previousCandidates: null | SudokuDigits[]
         classes: null | string[]
         candidateClasses: null | string[]
      } |
      {
         explaining: false
         previousCandidates: null
         classes: null
         candidateClasses: null
      }
   )
)>


/**
 * A cell in a sudoku
 * Handles Candidates, UserUse, and StrategyCode
 *
 * Ugh
 *
 * @example
 * <Cell row={1} column={4} />
 *
 * @requiredProps
 * - row
 * - column
 * - sudoku
 * - whenCellMounts
 * - whenCellUnmounts
 * - whenNewCandidates
 * - whenCellKeydown
 */
export default class Cell extends React.Component<CellProps, CellState> {
   static labelAt(row: IndexToNine, column: IndexToNine) {
      return `Cell at row ${row + 1}, column ${column + 1}` as const
   }

   constructor(props: CellProps) {
      _expect(Cell, props).toHaveProperties("row", "column", "whenCellMounts", "whenCellUnmounts", "whenNewCandidates", "whenCellKeydown")

      super(props)

      this.state = {
         /**
          * `explaining` is turned to true at the beginning of each strategy Step
          */
         explaining: false,

         /**
          * When `explaining` is true, the user can undo
          * This stores the previousCandidates, if changed
          */
         previousCandidates: null,

         /** An array of possible candidates.
           * Starts at [1, 2, 3, 4, 5, 6, 7, 8, 9] and updates in `whenKeyDown`
           */
         candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],

         /**
          * Used for styling - for example highlighting this cell blue
          */
         classes: null,

         /**
          * Used for styling - for example highlighting a candidate red
          *
          * Although the type is `string[] | null`, it's really
          * `{ [key: SudokuDigits]: string } | null`
          */
         candidateClasses: null,

         /** Whether to show candidates
           *
           * This has no effect when there's 0 or 1 candidates -
           * in those cases only a single digit is shown: 0 || 1 to 9
           *
           * `whenFocus` sets this to true
           * `whenBlur` sets this to true when 1 < candidates < 9
           * `shift+backspace` sets this to false
           */
         showCandidates: false,

         /** Whether the candidates array is empty */
         error: false,

         /** If this is currently focused by the user - set by whenFocus and whenBlur */
         active: false,

         /**
          * This boolean controls pretending.
          *
          * When an unbothered cell is focused, we pretend there are no candidates.
          * This makes it easier to fill in a sudoku
          *
          * Unbothered: showCandidates===false && numCandidates===9
          *
          * Very useful when you're just filling in digits
          */
         pretend: false
      }

      this.whenFocus = this.whenFocus.bind(this)
      this.whenBlur = this.whenBlur.bind(this)
      this.whenKeyDown = this.whenKeyDown.bind(this)
   }

   componentDidMount() {
      this.props.whenCellMounts(this)
   }

   componentWillUnmount() {
      this.props.whenCellUnmounts(this)
   }

   /** How many candidates are left */
   get numCandidates() {
      return this.state.candidates.length as ZeroToNine
   }

   clearCandidates() {
      this.setState({
         candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],
         showCandidates: false,
         error: false,
      })

      this.setExplainingToFalse()
   }

   setCandidatesTo(candidates: SudokuDigits[], callback?: () => void) {
      this.setState((prevState: CellState) => {
         // Same candidates
         if (prevState.candidates.sort().join('') === candidates.sort().join('')) {
            return prevState
         }

         const newState = { candidates } as Mutable<CellState>

         // Don't change previousCandidates if they already exist
         if (prevState.explaining) {
            if (prevState.previousCandidates === null) {
               newState.previousCandidates = prevState.candidates
            }
         }

         if (candidates.length === 0) {
            newState.showCandidates = false
            newState.error = true
         } else if (1 < candidates.length && candidates.length < 9) {
            newState.showCandidates = true
            newState.error = false
         } else {
            newState.showCandidates = false
            newState.error = false
         }

         return newState
      }, callback)
   }

   toggleCandidate(candidate: SudokuDigits) {
      this.setState((state: CellState) => {
         const candidates = new Set(state.pretend ? [] : state.candidates)
         const dataElement = document.getElementById('Data') as HTMLTextAreaElement

         if (candidates.has(candidate)) {
            candidates.delete(candidate)
         } else {
            candidates.add(candidate)
         }

         if (candidates.size === 0) {
            dataElement.value = "empty!"
            return {
               candidates: [],
               error: true
            }
         }

         dataElement.value = [...candidates].join('')
         return {
            candidates: [...candidates],
            error: false
         }
      })
   }

   /**
    * Adds a class to a bunch of candidates.
    *
    * @example
    * (new Cell()).highlight([2, 3, 4], 'blue') // Adds the class "blue" to the Candidates 2, 3, and 4
    *
    * @param candidates
    * @param color - This is really a css class, so remember to check `Candidate.css`
    */
   highlight(candidates: SudokuDigits[], color: string) {
      this.setState((state: CellState) => {
         if (state.explaining === false) {
            return null
         }

         // Array of 10
         const newCandidateClasses = state.candidateClasses ?? ['', '', '', '', '', '', '', '', '', '']

         const hasColorAlready = new RegExp(` ${color}( |$)`)
         for (const candidate of candidates) {
            if (!hasColorAlready.test(newCandidateClasses[candidate])) {
               newCandidateClasses[candidate] += ` ${color}`
            }
         }

         return {
            candidateClasses: newCandidateClasses
         }
      })
   }

   /**
    * Adds a class to the cell itself
    */
   addClass(color: string) {
      this.setState((state: CellState) => {
         if (state.explaining) {
            return {
               classes: [...(state.classes ?? []), color]
            }
         }
         return null
      })
   }

   setExplainingToTrue (callback?: _Callback) {
      this.setState({
         explaining: true,
      }, callback)
   }

   setExplainingToFalse (callback?: _Callback) {
      this.setState({
         explaining: false,
         previousCandidates: null,
         classes: null,
         candidateClasses: null,
      }, callback)
   }

   // BUG? Not using a callback for `setCandidatesTo`
   undo() {
      if (this.state.previousCandidates !== null) {
         this.setCandidatesTo(this.state.previousCandidates)
      }

      this.setExplainingToFalse()
   }

   render() {
      let content = <></>;
      const loading = <span className="small">loading</span>

      // Using a span for single digits
      // so that I can force cells to always be [css height: 1/9th]
      if (this.state.pretend) { // Nothing special happens in this case
         content = (
            <Suspense fallback={loading}>
               <Candidates data={this.state.candidates} classes={this.state.candidateClasses} />
            </Suspense>
         )
      } else if (this.state.active) {
         content = (
            <Suspense fallback={loading}>
               <Candidates data={this.state.candidates} classes={this.state.candidateClasses} />
            </Suspense>
         )
      } else if (this.state.explaining && this.state.previousCandidates !== null) {
         content = (
            <Suspense fallback={loading}>
               <CandidatesDiff previous={this.state.previousCandidates} current={this.state.candidates} classes={this.state.candidateClasses} />
            </Suspense>
         )
      } else if (this.numCandidates === 0) {
         content = <span className="ugh tables"> 0 </span>
      } else if (this.numCandidates === 1) {
         content = <span className={`ugh tables digit-${this.state.candidates[0]}`}> {this.state.candidates[0]} </span>
      } else if (this.state.showCandidates || this.state.candidates.length !== 9) {
         // Now numCandidates > 1. This is a fallback if statement
         content = (
            <Suspense fallback={loading}>
               <Candidates data={this.state.candidates} classes={this.state.candidateClasses} />
            </Suspense>
         )
      }


      const className = this.state.classes?.concat(['Cell']).join(' ') ?? 'Cell'

      // 1. inner div to separate aria roles
      //    and because <button> elements cannot contain tables
      // 2. tabIndex for focusability
      //    ="0" because of a11y thing
      return (
         <td className={className}>
            <div
               className={className}
               role='button'
               aria-label={Cell.labelAt(this.props.row, this.props.column)}
               data-error={this.state.error ? "true" : undefined}
               data-active={this.state.active ? "true" : undefined}
               tabIndex={0}
               onFocus={this.whenFocus}
               onBlur={this.whenBlur}
               onKeyDown={this.whenKeyDown}
            >{content}</div>
         </td>
      )
   }

   whenFocus(_event?: React.FocusEvent) {
      this.setState((state: CellState): CellState => {
         const newState = {
            active: true
         } as Mutable<Partial<CellState>>

         // See notes about state.pretend
         if (state.showCandidates === false && this.numCandidates === 9) {
            newState.pretend = true
         }

         return newState as CellState
      })
   }

   whenBlur(_event?: React.FocusEvent) {
      this.props.whenNewCandidates(this, this.state.candidates)
      this.setState((state: CellState): CellState => {
         const newState = {
            active: false,
            pretend: false // See notes about state.pretend
         } as Mutable<Partial<CellState>>

         if (1 < state.candidates.length && state.candidates.length < 9) {
            newState.showCandidates = true
         }
         return newState as CellState
      })
   }

   /**
    * Handler for "keyDown" events
    * Not handling "keypress" since that's deprecated.
    *
    * When a digit is pressed: "123456789",
    * then it toggles that candidate.
    *
    * Shift+Backspace resets the candidates to [1, 2, 3, 4, 5, 6, 7, 8, 9]
    * Backspace deletes the candidates (and so do `delete` and `clear`)
    *
    * Escape blurs the current cell
    *
    * TODO: Arrow key navigation
    */
   whenKeyDown(event: React.KeyboardEvent) {
      const target = event.target as HTMLTableCellElement
      if ('123456789'.includes(event.key)) {
         const candidate = Number(event.key) as SudokuDigits
         this.toggleCandidate(candidate)
      } else if (['Backspace', 'Delete', 'Clear'].includes(event.key)) {
         const dataElement = document.getElementById('Data') as HTMLTextAreaElement
         if (event.shiftKey) {
            this.setState({
               candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],
               showCandidates: false,
               error: false
            })
            dataElement.value = '123456789'
         } else {
            this.setState({
               candidates: [],
               error: true
            })
            dataElement.value = 'Empty!'
         }
      } else if (event.key in keyboardMappings) {
         // Keyboard controls
         this.props.whenCellKeydown(this, event)
      } else if (event.key === 'Escape') {
         target.blur()
      } else {
         // If nothing happens, don't do anything
         return;
      }

      // Something happened, (see "pretend" docs above)
      this.setState({ pretend: false })
   }
}
