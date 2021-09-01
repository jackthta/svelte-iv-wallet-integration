<script lang="ts">
    import { getContext } from 'svelte';
    import type { Asset } from '../../domain/asset'

    export let id: string = undefined;

    const assets: Map<string, Asset[]> = getContext('BalancesContext');
    const matchingAssets = assets.get(id);
</script>

<div class="flex flex-col items-center justify-start bg-gray-200 w-96">
  <div class="w-full px-4">
    <div class="flex items-center justify-between py-2 mb-1 text-lg font-semibold border border-t-0 border-l-0 border-r-0 border-black">
      {`${id} Assets`}
    </div>
  </div>

  <div class="flex flex-col items-center justify-between w-full overflow-y-scroll max-h-96">
    {#each matchingAssets as asset}
      <div class="flex items-center justify-between w-full px-4 py-1">
        <div class="text-sm font-semibold">{asset.asset}</div>

        <div class="text-sm italic">{asset.balance.toString()}</div>
      </div>
    {/each}
  </div>
</div>