<script lang="ts">
   import Cell from './Cell.svelte'
   import { INDICES_TO_NINE, type SudokuDigits } from '../core/types'
   import type { Workspace } from '../workspace.svelte'
   import { EMPTY_CELL_MARKS } from '../core/marks'
   import './Board.css'

   let { workspace }: { workspace: Workspace } = $props()
   let table: HTMLTableElement
   let navigating = false
   let pointerFocus = false
   // Held keys are event-only state; they do not drive rendering.
   // eslint-disable-next-line svelte/prefer-svelte-reactivity
   const pressed = new Set<string>()

   function focus(index: number) {
      if (navigating || pointerFocus) return
      workspace.select(index, pressed.has('Control') || pressed.has('Meta'))
   }

   function pointer(event: PointerEvent, index: number) {
      // Selection changes may replace the digit/candidate span under the
      // pointer before the browser's default focus action. Focus the stable
      // button explicitly so keyboard input cannot be left on the document.
      event.preventDefault()
      pointerFocus = true
      workspace.select(index, event.ctrlKey || event.metaKey)
      ;(event.currentTarget as HTMLButtonElement).focus({ preventScroll: true })
      pointerFocus = false
   }

   function keydown(event: KeyboardEvent, targetIndex: number) {
      if (event.key === 'Tab') return
      const modifier = event.ctrlKey || event.metaKey
      if (modifier && ['c', 'v', 'x'].includes(event.key.toLowerCase())) return
      if (modifier && event.key.toLowerCase() === 'z') {
         event.preventDefault()
         workspace.undo()
         return
      }
      if (modifier && event.key.toLowerCase() === 'a') {
         event.preventDefault()
         workspace.selectAll()
         return
      }
      if (/^[1-9]$/.test(event.key)) {
         event.preventDefault()
         workspace.edit(Number(event.key) as SudokuDigits)
         return
      }
      if (['Backspace', 'Delete', 'Clear'].includes(event.key)) {
         event.preventDefault()
         workspace.edit(event.shiftKey || modifier ? 'empty' : 'reset')
         return
      }
      if (event.key === 'Escape') {
         event.preventDefault()
         workspace.deselect()
         ;(event.currentTarget as HTMLElement).blur()
         return
      }
      if (
         ![
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'Home',
            'End',
            'PageUp',
            'PageDown'
         ].includes(event.key)
      )
         return
      event.preventDefault()
      // Combine held directions only on repeat: a quick Up then Right must move
      // once each, rather than replaying Up when the Right key first goes down.
      const movements = event.repeat ? new Set([...pressed, event.key]) : new Set([event.key])
      const move = (index: number) => {
         let row = Math.floor(index / 9),
            column = index % 9
         for (const key of movements) {
            if (key === 'ArrowUp') row = (row + 8) % 9
            if (key === 'ArrowDown') row = (row + 1) % 9
            if (key === 'ArrowLeft') column = (column + 8) % 9
            if (key === 'ArrowRight') column = (column + 1) % 9
            if (key === 'Home') {
               column = 0
               if (modifier) row = 0
            }
            if (key === 'End') {
               column = 8
               if (modifier) row = 8
            }
            if (key === 'PageUp') row = Math.max(0, row - 3)
            if (key === 'PageDown') row = Math.min(8, row + 3)
         }
         return row * 9 + column
      }
      workspace.moveSelection(move)
      navigating = true
      table.querySelector<HTMLButtonElement>(`[data-cell="${move(targetIndex)}"]`)?.focus()
      navigating = false
   }

   function blur() {
      if (!navigating && !pointerFocus) workspace.deactivate()
   }

   function windowBlur() {
      pressed.clear()
      workspace.deactivate()
   }
</script>

<svelte:window
   onkeydown={(event) => pressed.add(event.key)}
   onkeyup={(event) => pressed.delete(event.key)}
   onblur={windowBlur}
   oncontextmenu={() => pressed.clear()}
/>

<p
   id="board-help"
   class="sr-only"
>
   Use digits to toggle candidates, arrows to move, Control plus click for multiple selection, and
   Escape to deselect.
</p>

<!-- The table exposes grid selection; the inner buttons own focus and input. -->
<table
   bind:this={table}
   class="board"
   role="grid"
   aria-label="Sudoku"
   aria-multiselectable="true"
   aria-describedby="board-help"
>
   <tbody>
      {#each INDICES_TO_NINE as row (row)}
         <tr>
            {#each INDICES_TO_NINE as column (column)}
               {@const index = row * 9 + column}
               <Cell
                  {index}
                  candidates={workspace.session.grid[row][column]}
                  previous={workspace.session.previous?.[row][column]}
                  marks={workspace.session.annotations[index] ?? EMPTY_CELL_MARKS}
                  selected={workspace.selected.includes(index)}
                  active={workspace.selectionActive && workspace.selected.includes(index)}
                  onfocus={() => focus(index)}
                  onblur={blur}
                  onkeydown={(event) => keydown(event, index)}
                  onpointerdown={(event) => pointer(event, index)}
                  onclick={(event) => {
                     if (event.detail === 0) focus(index)
                  }}
               />
            {/each}
         </tr>
      {/each}
   </tbody>
</table>
