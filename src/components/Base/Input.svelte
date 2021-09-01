<script lang="ts">
    // Props
    export let name: string = undefined;
    export let label: string = undefined;
</script>

<div class="flex items-center justify-center">
    {#if label}
    <label class="text-sm" {name} for={name}>{label}</label>
    {/if}
    
    <!-- NOTE: Missing {...rest}; don't know how to have a prop like that -->
    <input 
      id={name}   
      class="px-4 py-2 my-2 text-black placeholder-black border border-gray-200 w-60 focus:outline-none focus:ring-transparent focus:border-gray-400 focus:shadow-input"
    />
  </div>