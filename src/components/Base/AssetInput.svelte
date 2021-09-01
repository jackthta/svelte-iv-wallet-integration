<script lang="ts">
    import Input from './Input.svelte';
    import type { Asset } from '../../domain/asset'
    import { getContext } from 'svelte';

    export let id: string;
    export let onChangeAsset: Function;
    export let onChangeAmount: Function;

    const balances: Map<string, Asset[]> = getContext('BalancesContext')
    let options = [] as { value: string; label: string}[];

    $: {
        const newOptions = balances.get(id)?.flatMap(asset => { return { value: asset.asset, label: asset.asset }});
        options = newOptions ?? [];
    }

    function handleChangeAsset(selected: { value: string; label: string } | null): void {
        onChangeAsset(selected?.value ?? null);
    }

    function handleChangeAmount(e): void {
        onChangeAmount(e.currentTarget.value);
    }
</script>

<div class="flex flex-col items-center justify-center w-96">
    <Input
      name={`amount-${id}`}
      on:change={handleChangeAmount}
    />
    
    <!-- TO DO: Make Select component -->
    <!-- <Select
      class="w-60"
      options={options}
      onChange={handleChangeAsset}
    /> -->
  </div>