<script lang="ts">
   import { onMount } from 'svelte'
   import './TransferDialog.css'
   import { exportGrid, type Grid } from '../core/session'
   let {
      mode,
      grid,
      onimport,
      onclose,
      returnFocus = null
   }: {
      mode: 'import' | 'export'
      grid: Grid
      onimport: (text: string) => boolean
      onclose: () => void
      returnFocus?: HTMLElement | null
   } = $props()
   let dialog: HTMLDialogElement
   let text = $state('')
   let error = $state('')
   let exported = $derived(exportGrid(grid))

   onMount(() => {
      const previous = returnFocus ?? (document.activeElement as HTMLElement | null)
      dialog.showModal()
      return () => {
         dialog.close()
         previous?.focus()
      }
   })

   function submit(event: SubmitEvent) {
      event.preventDefault()
      if (!text.trim()) {
         onclose()
         return
      }
      if (onimport(text)) onclose()
      else
         error =
            'Could not read this puzzle. Use 81 digits/blanks, 729 candidate characters, or 81 candidate groups separated by whitespace.'
   }
</script>

<dialog
   class="transfer-dialog"
   bind:this={dialog}
   oncancel={onclose}
   aria-labelledby="transfer-title"
>
   <h2 id="transfer-title">{mode === 'import' ? 'Import' : 'Export'}</h2>
   {#if mode === 'import'}
      <form onsubmit={submit}>
         <label for="puzzle-input">Enter digits or candidates</label>
         <p
            id="import-help"
            class="hint"
         >
            Accepts an 81-cell puzzle, a SudokuWiki URL, 729 candidate characters, or a
            whitespace-separated candidate grid.
         </p>
         <textarea
            id="puzzle-input"
            bind:value={text}
            rows="9"
            aria-describedby="import-help"
            aria-invalid={!!error}
            spellcheck="false"
         ></textarea>
         {#if error}<p
               class="error"
               role="alert"
            >
               {error}
            </p>{/if}
         <p class="controls">
            <button
               type="button"
               onclick={onclose}>Cancel</button
            ><button type="submit">Submit</button>
         </p>
      </form>
   {:else}
      <p class="hint">
         Select and copy either representation. The candidate format preserves every candidate,
         including empty cells.
      </p>
      <label for="export-digits">81-cell digits</label>
      <textarea
         id="export-digits"
         value={exported.digits}
         rows="9"
         readonly
         spellcheck="false"
      ></textarea>
      <label for="export-candidates">729-character candidates</label>
      <textarea
         id="export-candidates"
         value={exported.candidates}
         rows="5"
         readonly
         spellcheck="false"
      ></textarea>
      <p class="controls">
         <button
            type="button"
            onclick={onclose}>Close</button
         >
      </p>
   {/if}
</dialog>
