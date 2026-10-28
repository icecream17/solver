<script lang="ts">
   import { catalog } from '../core/catalog'
   import type { Workspace } from '../workspace.svelte'
   let { workspace, onimport, onexport }: { workspace: Workspace; onimport: () => void; onexport: () => void } = $props()
   let tab = $state(0)
   let tablist: HTMLDivElement
   const tabs = ['solving tools', 'strategies']

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
   <div class="tabs" role="tablist" aria-label="Solver panels" bind:this={tablist}>
      {#each tabs as name, index}
         <button type="button" role="tab" id={`tab-${index}`} aria-selected={tab === index}
            aria-controls={`panel-${index}`} tabindex={tab === index ? 0 : -1}
            onclick={() => { tab = index }} onkeydown={event => tabKey(event, index)}>{name}</button>
      {/each}
   </div>
   <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} tabindex="0">
      {#if tab === 0}
         <div class="controls">
            <button type="button" onclick={() => workspace.clear()}>clear</button>
            <button type="button" onclick={onimport}>import</button>
            <button type="button" onclick={onexport}>export</button>
            <button type="button" onclick={() => workspace.undo()} disabled={!workspace.canUndo}>undo</button>
         </div>
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
         <div class="controls">
            <button type="button" onclick={() => workspace.solve('step')}>step</button>
            <button type="button" onclick={() => workspace.solve('go')}>go</button>
            <button type="button" onclick={() => workspace.undo()} disabled={!workspace.canUndo}>undo</button>
         </div>
         <p class="hint">Step tries one strategy. Go stops at the next successful strategy or the end of a pass.</p>
         <fieldset>
            <legend>strategies</legend>
            <ol class="strategy-list">
               {#each catalog as strategy, index}
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
                        <a class="strategy-link" href={strategy.href} target="_blank" rel="noreferrer"
                           aria-label={`Learn about ${strategy.name}`} title={`Learn about ${strategy.name}`}>↗</a>
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
            <div class="legend"><span class="blue">reason</span><span class="green">alternate</span><span class="orange">pivot</span><span class="eliminated">eliminated</span><span class="added">added</span></div>
         </details>
      {/if}
   </div>
</section>
