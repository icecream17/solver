<script lang="ts">
   import type { Workspace } from '../workspace.svelte'
   import { ALL_CANDIDATES } from '../core/types'
   let { workspace }: { workspace: Workspace } = $props()
</script>

<!-- Touch input does not depend on a physical or on-screen text keyboard. -->
<fieldset class="candidate-pad" disabled={!workspace.selected.length}>
   <legend>Selected cells</legend>
   <p class="candidate-keys">
      {#each ALL_CANDIDATES as digit (digit)}
         <button type="button" aria-label={`Toggle candidate ${digit}`} onclick={() => workspace.edit(digit)}>{digit}</button>
      {/each}
   </p>
   <p class="controls">
      <button type="button" onclick={() => workspace.edit('reset')}>reset candidates</button>
      <button type="button" onclick={() => workspace.edit('empty')}>remove all</button>
   </p>
</fieldset>

<style>
   .candidate-pad { display: none; }
   @media (max-width: 900px), (any-pointer: coarse) {
      .candidate-pad { display: block; border: 0; padding: 0; margin-block: 1rem; }
      legend { font-size: .8rem; color: var(--muted); }
      .candidate-keys { display: grid; grid-template-columns: repeat(9, 1fr); gap: .25rem; }
      .candidate-keys button { min-height: 2.75rem; border: 1px solid var(--muted); background: var(--panel-color); color: var(--text-color); border-radius: .2rem; }
   }
   @media print { .candidate-pad { display: none; } }
</style>
