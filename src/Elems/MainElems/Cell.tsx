// @flow

import React, { Suspense } from 'react';
import { algebraic } from '../../Api/Utils';
import { IndexToNine, SudokuDigits, ZeroToNine, _Callback } from '../../Types';
import { arraysAreEqual } from '../../utils';

const Candidates = React.lazy(() => import('./Candidates'));
const CandidatesDiff = React.lazy(() => import('./CandidatesDiff'));

export type BaseCellProps = Readonly<{
   row: IndexToNine
   column: IndexToNine

   whenNewCandidates: (cell: Cell, candidates: SudokuDigits[]) => void
   whenCellKeydown: (cell: Cell, event: React.KeyboardEvent) => void

   whenCellMounts: _Callback
   whenCellUnmounts: _Callback
}>

type CellProps = BaseCellProps

type _UserDisplayState =
   { active: false; pretend: false } |
   { active: true; pretend: boolean }

type _TrackCandidateState =
   {
      explaining: true
      previousCandidates: SudokuDigits[]
      classes: null | string[]
      candidateClasses: null | (Record<IndexToNine, string> & string[])
      highlighted: boolean
   } |
   {
      explaining: false
      previousCandidates: null
      classes: null
      candidateClasses: null
      highlighted: false
   }

type CellState = Readonly<(
   {
      candidates: SudokuDigits[]
      error: boolean
   } & _UserDisplayState & _TrackCandidateState
)>


/**
 * A cell in a sudoku
 * Handles Candidates, UserUse, and StrategyCode
 *
 * Ugh
 *
 * @example
 * <Cell row={1} column={4} />
 */
export default class Cell extends React.Component<CellProps, CellState> {
   static labelAt (row: IndexToNine, column: IndexToNine) {
      return `Cell at row ${row + 1}, column ${column + 1}` as const
   }

   static title (row: IndexToNine, column: IndexToNine) {
      return `${algebraic(row, column)}` // TODO: Add sudoku title
   }

   constructor (props: CellProps) {
      super(props)

      this.state = {
         /**
          * !misnomer
          * Candidate changes when explaining are tracked (see previousCandidates)
          * Set to false then true when starting a strategy.
          * Set to false if the strategy fails
          * Set to false on clear and undo
          */
         explaining: false,

         /**
          * When `explaining` is true, the user can undo
          * This stores the previousCandidates, if changed
          * Used by CandidatesDiff to display eliminated / added candidates.
          */
         previousCandidates: null,

         /**
          * The candidates, aka the possible digits of a cell
          * Updates in `whenKeyDown` or by strategies.
          */
         candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],

         /**
          * Used for styling - for example highlighting this cell blue
          */
         classes: null,

         /**
          * Used for styling - for example highlighting a candidate red
          */
         candidateClasses: null,

         /** Whether the candidates array is empty */
         error: false,

         /** If this is currently focused by the user - set by whenFocus and whenBlur */
         active: false,

         /**
          * This boolean controls pretending.
          *
          * When an unchanged cell is focused, we pretend there are no candidates.
          * This makes it _so_ much easier to fill in digits
          *
          * Unchanged: numCandidates===9
          */
         pretend: false,

         /**
          * Whether a candidate is being highlighted
          */
         highlighted: false,
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

   /** How many candidates are left, this.state.candidates.length */
   get numCandidates() {
      return this.state.candidates.length as ZeroToNine
   }

   clearCandidates() {
      this.setState({
         candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],
         error: false,
      })

      this.setExplainingToFalse()
   }

   setCandidatesTo(candidates: SudokuDigits[], callback?: () => void) {
      this.setState((prevState: CellState) => {
         // Same candidates
         if (arraysAreEqual(prevState.candidates.sort(), candidates.sort())) {
            return prevState
         }

         // Note: Edits can be undone by, well, undoing and setting back to previousCandidates
         return {
            candidates,
            error: candidates.length === 0
         }
      }, callback)
   }

   toggleCandidate(candidate: SudokuDigits) {
      this.setState((state: CellState) => {
         const candidates = new Set(state.pretend ? [] : state.candidates)

         if (candidates.has(candidate)) {
            candidates.delete(candidate)
         } else {
            candidates.add(candidate)
         }

         return {
            candidates: [...candidates],
            error: candidates.size === 0
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
    * @param colorClass - This is a css class, so check/update `Candidate.css`
    */
   highlight(candidates: SudokuDigits[], colorClass: string) {
      this.setState((state: CellState) => {
         if (state.explaining === false) {
            return null
         }

         // Array of 9
         const newCandidateClasses = state.candidateClasses ?? ['', '', '', '', '', '', '', '', '']

         const hasColorAlready = new RegExp(` ${colorClass}( |$)`)
         for (const candidate of candidates) {
            if (!hasColorAlready.test(newCandidateClasses[candidate - 1 as IndexToNine])) {
               newCandidateClasses[candidate - 1 as IndexToNine] += ` ${colorClass}`
            }
         }

         return {
            candidateClasses: newCandidateClasses,
            highlighted: true,
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
      this.setState(state => ({
         explaining: true,
         previousCandidates: state.previousCandidates ?? state.candidates,
      }), callback)
   }

   setExplainingToFalse (callback?: _Callback) {
      this.setState({
         explaining: false,
         previousCandidates: null,
         classes: null,
         candidateClasses: null,
         highlighted: false,
      }, callback)
   }

   // BUG? Not using a callback for `setCandidatesTo`
   undo(callback?: _Callback) {
      if (this.state.previousCandidates !== null) {
         this.setCandidatesTo(this.state.previousCandidates)
      }

      this.setExplainingToFalse(callback)
   }

   render() {
      let content = <></>;
      const loading = <span className="Loading">loading</span>

      // Using a span for single digits
      // so that I can force cells to always be [css height: 1/9th]
      if (this.state.explaining && !arraysAreEqual(this.state.previousCandidates.sort(), this.state.candidates.sort())) {
         content = (
            <Suspense fallback={loading}>
               <CandidatesDiff previous={this.state.previousCandidates} current={this.state.candidates} classes={this.state.candidateClasses} />
            </Suspense>
         )
      } else if (this.state.active || this.state.highlighted || (this.numCandidates > 1 && this.numCandidates < 9)) {
         // Also show candidates when editing a cell
         // Also show candidates as fallback when numCandidates is in [2, 8]
         content = (
            <Suspense fallback={loading}>
               <Candidates data={this.state.candidates} classes={this.state.candidateClasses} />
            </Suspense>
         )
      } else if (this.numCandidates === 0) {
         content = <span className="ugh tables"> 0 </span>
      } else if (this.numCandidates === 1) {
         content = <span className={`ugh tables digit-${this.state.candidates[0]}`}> {this.state.candidates[0]} </span>
      }


      const className = this.state.classes?.concat(['Cell']).join(' ') ?? 'Cell'

      // 1. inner div to separate aria roles
      //    and because <button> elements cannot contain tables
      // 2. tabIndex for focusability
      //    ="0" because of a11y thing
      return (
         <td
            className={className}
            aria-selected={this.state.active ? "true" : undefined}
         >
            <div
               className={className}
               role='button'
               title={Cell.title(this.props.row, this.props.column)}
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
      this.setState(
         state => ({
            active: true,
            pretend: state.candidates.length === 9
         }) as const
      )
   }

   whenBlur(_event?: React.FocusEvent) {
      this.props.whenNewCandidates(this, this.state.candidates)
      this.setState({
         active: false,
         pretend: false // See notes about state.pretend
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
         if (event.shiftKey || event.altKey) {
            this.setState({
               candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9],
               error: false
            })
         } else {
            this.setState({
               candidates: [],
               error: true
            })
         }
      } else if (event.key === 'Escape') {
         target.blur()
      } else {
         this.props.whenCellKeydown(this, event) // keyboard controls
      }

      // Something happened, (see "pretend" docs above)
      this.setState({ pretend: false })
   }
}
