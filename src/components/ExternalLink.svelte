<script lang="ts">
   import type { Snippet } from 'svelte'
   import type { HTMLAnchorAttributes } from 'svelte/elements'

   type Props = Omit<HTMLAnchorAttributes, 'href' | 'target' | 'rel' | 'children' | 'onclick'> & {
      href: string
      children: Snippet
   }

   let { href, children, class: className = '', ...attributes }: Props = $props()
</script>

<!-- Keep external-link privacy and event behavior in one place. -->
<a
   {...attributes}
   {href}
   class={`App-link ${className}`.trim()}
   target="_blank"
   rel="noopener noreferrer"
   referrerpolicy="no-referrer"
   onclick={event => event.stopPropagation()}
>
   {@render children()}
</a>
