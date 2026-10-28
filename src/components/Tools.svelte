<script lang="ts">
   import { catalog } from '../core/catalog'
   import ExternalLink from './ExternalLink.svelte'
   import { stepExplanations } from '../core/explanations'
   import './Tools.css'
   import type { Workspace } from '../workspace.svelte'
   let { workspace, onimport, onexport }: { workspace: Workspace; onimport: (trigger: HTMLButtonElement) => void; onexport: (trigger: HTMLButtonElement) => void } = $props()
   let tab = $state(0)
   let tablist: HTMLElement
   const tabs = ['solving tools', 'strategies']
   let explanationDetails = $derived(stepExplanations(workspace.session.grid, workspace.session.previous, workspace.session.annotations))

   function tabKey(event: KeyboardEvent, index: number) {
      let next: number
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = tabs.length - 1
      else return
      event.preventDefault()
      tab = next
      tablist.querySelector<HTMLButtonElement>(`#tab-${next}`)?.focus()
   }
</script>

<section class="tools" aria-label="Solving tools">
   <!-- Generic containers are intentional for the APG tablist/tabpanel roles. -->
   <div class="tabs" role="tablist" aria-label="Solver panels" bind:this={tablist}>
      {#each tabs as name, index (name)}
         <button type="button" role="tab" id={`tab-${index}`} aria-selected={tab === index}
            aria-controls={`panel-${index}`} tabindex={tab === index ? 0 : -1}
            onclick={() => { tab = index }} onkeydown={event => tabKey(event, index)}>{name}</button>
      {/each}
   </div>
   <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} tabindex="0">
      {#if tab === 0}
         <p class="controls">
            <button type="button" onclick={() => workspace.clear()}>clear</button>
            <button type="button" onclick={event => onimport(event.currentTarget)}>import</button>
            <button type="button" onclick={event => onexport(event.currentTarget)}>export</button>
            <button type="button" onclick={() => workspace.undo()} disabled={!workspace.canUndo}>undo</button>
            {#if workspace.busy}<button type="button" onclick={() => workspace.cancelSolve()}>cancel solving</button>{/if}
         </p>
         <p class="hint">Enter a puzzle, then use the strategies tab to solve it one logical step at a time.</p>
         <details class="help" open>
            <summary>Keyboard controls</summary>
            <ul>
               <li><kbd>1–9</kbd> toggle candidates. The first digit in an untouched cell starts a new entry.</li>
               <li><kbd>Backspace</kbd> / <kbd>Delete</kbd> reset candidates. Add <kbd>Ctrl</kbd> or <kbd>Shift</kbd> to remove them all.</li>
               <li>Arrow keys move with wrapping; <kbd>Tab</kbd> follows cells in reading order.</li>
               <li><kbd>Home</kbd> / <kbd>End</kbd> move within a row; add <kbd>Ctrl</kbd> for the whole board.</li>
               <li><kbd>Page Up</kbd> / <kbd>Page Down</kbd> move three rows.</li>
               <li><kbd>Ctrl</kbd> + click selects multiple cells; <kbd>Ctrl+A</kbd> selects all. <kbd>Escape</kbd> clears selection.</li>
               <li><kbd>Ctrl+Z</kbd> undoes a board edit or solver step. On macOS, <kbd>⌘</kbd> also works.</li>
            </ul>
         </details>
      {:else}
         <p class="controls">
            <button type="button" onclick={() => workspace.solve('step')} disabled={workspace.busy}>step</button>
            <button type="button" onclick={() => workspace.solve('go')} disabled={workspace.busy}>go</button>
            <button type="button" onclick={() => workspace.undo()} disabled={!workspace.canUndo}>undo</button>
            {#if workspace.busy}<button type="button" onclick={() => workspace.cancelSolve()}>cancel solving</button>{/if}
         </p>
         <p class="hint">Step tries one strategy. Go stops at the next successful strategy or the end of a pass.</p>
         <fieldset>
            <legend>strategies</legend>
            <ol class="strategy-list">
               {#each catalog as strategy, index (strategy.name)}
                  {@const result = workspace.session.results[index]}
                  <li class:current={workspace.session.lastStrategy === index} class:disabled={workspace.session.disabled[index]}>
                     <label>
                        {#if !strategy.required}
                           <input type="checkbox" role="switch" aria-label={`Toggle ${strategy.name}`}
                              checked={!workspace.session.disabled[index]}
                              onchange={event => workspace.toggleStrategy(index, event.currentTarget.checked)} />
                        {:else}<span class="required" title="Required strategy" aria-hidden="true">•</span>{/if}
                        <span>{strategy.name}</span>
                     </label>
                     {#if strategy.href}
                        <ExternalLink class="strategy-link" href={strategy.href}
                           aria-label={`Learn about ${strategy.name}`} title={`Learn about ${strategy.name}`}>↗</ExternalLink>
                     {:else}<span></span>{/if}
                     <span class="strategy-result" aria-label={`Status for ${strategy.name}`}
                        class:success={result?.success} class:error={result?.successcount === -1}
                        class:fail={result && !result.success}>
                        {result ? result.success ? result.successcount === 1 ? 'Yes' : result.successcount ?? 'Yes' : result.successcount === -1 ? 'Error!' : 'No' : ''}
                     </span>
                  </li>
               {/each}
            </ol>
         </fieldset>
         <details class="explanation" open>
            <summary>Strategy explanation</summary>
            <p>{workspace.session.message || 'Run a strategy to see its explanation.'}</p>
            <ul class="legend" aria-label="Explanation key"><li class="blue">reason</li><li class="green">alternate</li><li class="orange">pivot</li><li class="eliminated">eliminated</li><li class="added">added</li></ul>
            {#if explanationDetails.length}
               <details>
                  <summary>Cell changes and reasoning</summary>
                  <ul class="step-details">{#each explanationDetails as detail (detail)}<li>{detail}</li>{/each}</ul>
               </details>
            {/if}
         </details>
      {/if}
   </div>
</section>
