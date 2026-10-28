<script lang="ts">
   import { ALL_CANDIDATES, type SudokuDigits } from '../core/types'
   import type { CellMarks } from '../core/marks'
   import { cellExplanation } from '../core/explanations'
   import './Cell.css'

   // Board data and selection arrive as props; callbacks keep edits in Workspace.
   let {
      index,
      candidates,
      previous,
      marks,
      selected,
      active,
      onfocus,
      onblur,
      onkeydown,
      onpointerdown,
      onclick
   }: {
      index: number
      candidates: SudokuDigits[]
      previous?: SudokuDigits[]
      marks: CellMarks
      selected: boolean
      active: boolean
      onfocus: () => void
      onblur: () => void
      onkeydown: (event: KeyboardEvent) => void
      onpointerdown: (event: PointerEvent) => void
      onclick: (event: MouseEvent) => void
   } = $props()

   // Display candidates while editing or while explaining a change.
   let changed = $derived(
      previous !== undefined &&
         (previous.length !== candidates.length ||
            previous.some((digit) => !candidates.includes(digit)))
   )
   let highlighted = $derived(Object.keys(marks.candidates).length > 0)
   let showCandidates = $derived(
      changed || active || highlighted || (candidates.length > 1 && candidates.length < 9)
   )
   let row = $derived(Math.floor(index / 9))
   let column = $derived(index % 9)
   let explanation = $derived(cellExplanation(candidates, previous, marks))

   // Candidate diffs take precedence over strategy reasoning marks.
   function candidateColor(digit: SudokuDigits) {
      if (changed && previous?.includes(digit) !== candidates.includes(digit)) {
         return candidates.includes(digit) ? 'added' : 'eliminated'
      }
      return marks.candidates[digit]?.join(' ') ?? ''
   }
</script>

<td
   role="gridcell"
   aria-selected={selected}
   class={`Cell ${marks.cells.join(' ')}`}
>
   <button
      type="button"
      class="cell"
      data-cell={index}
      data-active={selected ? String(active) : undefined}
      data-error={candidates.length === 0 || undefined}
      aria-label={`Cell at row ${row + 1}, column ${column + 1}`}
      aria-describedby={`cell-value-${index}`}
      title={`${'ABCDEFGHJ'[row]}${column + 1}`}
      {onfocus}
      {onblur}
      {onkeydown}
      {onpointerdown}
      {onclick}
   >
      <span
         id={`cell-value-${index}`}
         class="sr-only"
      >
         {candidates.length === 9
            ? 'All candidates'
            : candidates.length === 0
              ? 'No candidates'
              : `Candidates: ${candidates.join(', ')}`}
         {explanation}
      </span>
      {#if showCandidates}
         <span
            class="candidates"
            aria-hidden="true"
         >
            {#each ALL_CANDIDATES as digit (digit)}
               <span
                  class={`candidate ${candidateColor(digit)}`}
                  data-digit={digit}
               >
                  {#if candidates.includes(digit)}
                     {digit}
                  {:else if changed && previous?.includes(digit)}
                     <s>{digit}</s>
                  {/if}
               </span>
            {/each}
         </span>
      {:else if candidates.length <= 1}
         <span
            class="digit"
            aria-hidden="true">{candidates[0] ?? 0}</span
         >
      {/if}
   </button>
</td>
