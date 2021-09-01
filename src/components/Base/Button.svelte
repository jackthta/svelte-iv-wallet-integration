<script lang="ts">
    export let disabled: boolean = false;
    export let onClick;
</script>

<button
    class="inline-flex items-center bg-transparent px-4 py-2 font-semibold rounded-full border border-black"
    {disabled}
    on:click={onClick}>
      <slot />
</button>