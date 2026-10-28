<script lang="ts">
   import Board from './components/Board.svelte'
   import Tools from './components/Tools.svelte'
   import TransferDialog from './components/TransferDialog.svelte'
   import { Workspace } from './workspace.svelte'

   const workspace = new Workspace()
   let transfer = $state<'import' | 'export' | null>(null)
</script>

<svelte:head><title>Sudoku solver</title></svelte:head>

<svelte:boundary>
<header>
   <h1>Sudoku solver <span class="version">v0.37.0</span></h1>
   <a href="https://github.com/icecream17/solver" class="github-link" aria-label="View source on GitHub">GitHub ↗</a>
</header>

<main>
   <section class="board-area" aria-label="Puzzle">
      <Board {workspace} />
      <p class="board-caption">{'ABCDEFGHJ'.split('').join(' · ')} <span>rows · columns 1–9</span></p>
      <p class:error={workspace.session.outcome === 'error'} class:success={workspace.session.outcome === 'solved'}
         class="notice" role="status" aria-live="polite">{workspace.session.message}</p>
   </section>
   <Tools {workspace} onimport={() => { transfer = 'import' }} onexport={() => { transfer = 'export' }} />
</main>

{#if transfer}
   <TransferDialog mode={transfer} grid={workspace.session.grid}
      onimport={text => workspace.import(text)} onclose={() => { transfer = null }} />
{/if}

   {#snippet failed(error, reset)}
      <section class="render-error" role="alert">
         <h1>Something went wrong</h1>
         <p>Please <a href="https://github.com/icecream17/solver/issues">report this error on GitHub</a>.</p>
         <pre>{error instanceof Error ? `${error.name}: ${error.message}` : String(error)}</pre>
         <div class="controls"><button type="button" onclick={reset}>Close error notice</button></div>
      </section>
   {/snippet}
</svelte:boundary>
