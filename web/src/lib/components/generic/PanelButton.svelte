<script lang="ts">
  let class_names = '';
  export {class_names as class};
  export let label: string | undefined = undefined;
  export let disabled = false;
  export let href: string | undefined = undefined;
</script>

<div class="inline-block {class_names}">
  {#if href}
    <a
      {href}
      {disabled}
      {label}
      class="m-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md
    text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2
    focus:ring-indigo-500"
    >
      <slot />
    </a>
  {:else}
    <button
      on:click
      {disabled}
      {label}
      class="m-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md
    text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2
    focus:ring-indigo-500"
    >
      <slot />
    </button>
  {/if}
</div>
