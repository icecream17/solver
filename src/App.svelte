<script lang="ts">
   import Board from './components/Board.svelte'
   import Tools from './components/Tools.svelte'
   import TransferDialog from './components/TransferDialog.svelte'
   import { Workspace } from './workspace.svelte'
   import { onDestroy } from 'svelte'
   import GithubCorner from './components/GithubCorner.svelte'
   import ExternalLink from './components/ExternalLink.svelte'
   import CandidatePad from './components/CandidatePad.svelte'

   let { workspace = new Workspace() }: { workspace?: Workspace } = $props()
   let transfer = $state<'import' | 'export' | null>(null)
   let transferTrigger = $state<HTMLElement | null>(null)

   function openTransfer(mode: 'import' | 'export', trigger: HTMLElement) {
      transferTrigger = trigger
      transfer = mode
   }

   onDestroy(() => workspace.cancelSolve())
</script>

<svelte:head><title>Sudoku solver</title></svelte:head>

<svelte:boundary>
<header>
   <h1>Sudoku solver <span class="version">v0.37.0</span></h1>
   <GithubCorner />
</header>

<main>
   <section class="board-area" aria-label="Puzzle">
      <Board {workspace} />
      <CandidatePad {workspace} />
      <p class="board-caption">{'ABCDEFGHJ'.split('').join(' · ')} <span>rows · columns 1–9</span></p>
      <p class:error={workspace.session.outcome === 'error'} class:success={workspace.session.outcome === 'solved'}
         class="notice" role="status" aria-live="polite">{workspace.operationMessage || workspace.session.message}</p>
   </section>
   <Tools {workspace} onimport={trigger => openTransfer('import', trigger)} onexport={trigger => openTransfer('export', trigger)} />
</main>

{#if transfer}
   <TransferDialog returnFocus={transferTrigger} mode={transfer} grid={workspace.session.grid}
      onimport={text => workspace.import(text)} onclose={() => { transfer = null }} />
{/if}

   {#snippet failed(error, reset)}
      <section class="render-error" role="alert">
         <h1>Something went wrong</h1>
         <p>Please <ExternalLink href="https://github.com/icecream17/solver/issues">report this error on GitHub</ExternalLink>.</p>
         <pre>{error instanceof Error ? `${error.name}: ${error.message}` : String(error)}</pre>
         <p class="controls"><button type="button" onclick={reset}>Close error notice</button></p>
      </section>
   {/snippet}
</svelte:boundary>
