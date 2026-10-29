<script lang="ts">
   import type { Snippet } from 'svelte'
   import type { HTMLAnchorAttributes } from 'svelte/elements'

   type Props = Omit<HTMLAnchorAttributes, 'href' | 'target' | 'rel' | 'children' | 'onclick'> & {
      href: string
      children: Snippet
   }

   let { href, children, class: className = '', ...attributes }: Props = $props()
</script>

<!-- Keep privacy attributes together; clicks must not also activate a containing control. -->
<a
   {...attributes}
   {href}
   class={`App-link ${className}`.trim()}
   target="_blank"
   rel="noopener noreferrer"
   referrerpolicy="no-referrer"
   onclick={(event) => event.stopPropagation()}
>
   {@render children()}
</a>
