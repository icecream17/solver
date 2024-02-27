import React from 'react';
import { algebraic, id } from '../../Api/Utils';
import { IndexToNine, SudokuDigits, ZeroToNine, _Callback } from '../../Types';
import { arraysAreEqual } from '../../utils';

import Candidates from './Candidates';
import CandidatesDiff from './CandidatesDiff';

export type BaseCellProps = Readonly<{
   row: IndexToNine
   column: IndexToNine

   whenNewCandidates: (cell: Cell, candidates: SudokuDigits[]) => void
   whenCellKeydown: (cell: Cell, event: React.KeyboardEvent) => void
   whenCellBlur: (cell: Cell, event: React.FocusEvent) => void
   whenCellFocus: (cell: Cell, event: React.FocusEvent) => void

   whenCellMounts: _Callback
   whenCellUnmounts: _Callback
}>

type CellProps = BaseCellProps

// null = not selected
// false = selection inactive
// true = selection active
type _UserDisplayState =
   { active: false | null; pretend: false } |
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

type CellState = Readonly<
   {
      candidates: SudokuDigits[]
      error: boolean
   } & _UserDisplayState & _TrackCandidateState
>


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

         /**
          * If the cell is included in the selection and the cell is currently active.
          * 
          * If the cell is included, this is a boolean, false is the selection is deactivated.
          */
         active: null,

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
          * If so, we display in all-candidates mode even if there's only one
          */
         highlighted: false,
      }

      this.whenFocus = this.whenFocus.bind(this)
      this.whenBlur = this.whenBlur.bind(this)
      this.whenKeyDown = this.whenKeyDown.bind(this)
   }

   // This is the key. If visuals and data are inconsistent, data is changed to reflect visuals.
   // Otherwise they are modified in tandem. This callback allows indirect access to the data,
   // and originate from App.tsx
   componentDidMount() {
      this.props.whenCellMounts(this)
   }

   componentWillUnmount() {
      this.props.whenCellUnmounts(this)
   }

   get id() {
      return id(this.props.row, this.props.column)
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

      // Using a span for single digits
      // so that I can force cells to always be [css height: 1/9th]
      if (this.state.explaining && !arraysAreEqual(this.state.previousCandidates.sort(), this.state.candidates.sort())) {
         content = <CandidatesDiff previous={this.state.previousCandidates} current={this.state.candidates} classes={this.state.candidateClasses} />
      } else if (this.state.active || this.state.highlighted || (this.numCandidates > 1 && this.numCandidates < 9)) {
         // Also show candidates when editing a cell (actively)
         // Also show candidates as fallback when numCandidates is in [2, 8]
         content = <Candidates data={this.state.candidates} classes={this.state.candidateClasses} />
      } else if (this.numCandidates === 0) {
         content = <span className="ugh tables"> 0 </span>
      } else if (this.numCandidates === 1) {
         content = <span className={`ugh tables digit-${this.state.candidates[0]}`}> {this.state.candidates[0]} </span>
      }


      const className = this.state.classes?.concat(['Cell']).join(' ') ?? 'Cell'

      // TODO: contenteditable attribute on td will cause it to be editable and tab-focusable
      //       However there is no easy way to describe the custom text field
      // 1. inner div to separate aria roles
      //    and because <button> elements cannot contain block elements
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
               data-error={this.state.error || undefined}
               data-active={this.state.active ?? undefined}
               tabIndex={0}
               onFocus={this.whenFocus}
               onBlur={this.whenBlur}
               onKeyDown={this.whenKeyDown}
            >{content}</div>
         </td>
      )
   }

   updateSelectionStatus(isSelected: boolean, status: null | boolean) {
      const active = isSelected ? status : null
      this.setState((state: CellState) => ({
         active,
         pretend: active ? state.candidates.length === 9 : false
      }))
   }

   // setState for both of these is called in the when handlers through updateSelectionStatus,
   // but should be consistent with the commented out code
   whenFocus(event: React.FocusEvent) {
      this.props.whenCellFocus(this, event)
      // this.setState(
      //    state => ({
      //       active: true,
      //       pretend: state.candidates.length === 9
      //    }) as const
      // )
   }

   whenBlur(event: React.FocusEvent) {
      this.props.whenNewCandidates(this, this.state.candidates)
      this.props.whenCellBlur(this, event)
      // this.setState({
      //    active: false,
      //    pretend: false // See notes about state.pretend
      // })
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
      this.props.whenCellKeydown(this, event) // keyboard controls

      // Something happened, (see "pretend" docs above)

      // TODO: See Changelog v0.35.0
      //       Uncommenting this wouldn't work though, since it only affects one cell not the whole selection.
      // this.setState({ pretend: false })
   }
}
