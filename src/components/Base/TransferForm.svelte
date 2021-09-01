<script lang="ts">
    import Button from './Button.svelte';
    import AssetInput from './AssetInput.svelte';
    import type { Wallet } from '../../domain/wallet';
    import { constructClient } from '../../service/hedera';

    // import {
    //     TokenId,
    //     Hbar,
    //     TransferTransaction,
    //     TokenAssociateTransaction
    // } from '@hashgraph/sdk';

    // Props
    export let label: string;
    export let sender: Wallet;
    export let recipient: Wallet;
    export let onTransfer: Function = undefined;

    // State
    let busy = false;
    let error = "";
    let success = "";
    let asset = "Hbar";
    let amount = "0";

    async function handleTransfer(): Promise<void> {
        error = "";
        success = "";
        
        if (asset === "" || amount === "") {
            error = "Please select an asset and enter an amount.";
            return;
        }

        try {
            busy = true;
            
            const {
                TokenId,
                Hbar,
                TransferTransaction,
                TokenAssociateTransaction
            } = await import("@hashgraph/sdk");
            
            const client = await constructClient(sender);
            if (client == null) {
                throw new Error(`Could not construct client for ${sender.accountId.toString()}`);
            }
            
            if (asset === "Hbar") {
                const hbar = new Hbar(parseInt(amount));

                // Transfer Hbar
                const transfer = new TransferTransaction()
                .setMaxTransactionFee(new Hbar(1))
                .setTransactionMemo(`${label}`)
                .addHbarTransfer(sender.accountId, hbar.negated())
                .addHbarTransfer(recipient.accountId, hbar);

                // Get Receipt
                const receipt = await (
                await transfer.execute(client)
                ).getReceipt(client);

                success = `${receipt.status}`;
            } else {
                const token = TokenId.fromString(asset);
                const count = parseInt(amount);

                // Associate Token
                try {        
                    const associate = new TokenAssociateTransaction()
                        .setAccountId(recipient.accountId)
                        .setTokenIds([token])
                        .setMaxTransactionFee(new Hbar(1));
                    await (await associate.execute(client)).getReceipt(client);
                } catch (error) {
                    // Continue if Already Associated
                    if (!error.message.includes("TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT")) {
                        throw error;
                    }
                }
                
                // Token Transfer
                const transfer = new TransferTransaction()
                    .setMaxTransactionFee(new Hbar(1))
                    .setTransactionMemo(`${label}`)
                    .addTokenTransfer(token, sender.accountId, -count)
                    .addTokenTransfer(token, recipient.accountId, count);

                // Get Receipt
                const receipt = await (
                    await transfer.execute(client)
                    ).getReceipt(client);

                success = `${receipt.status}`;

                // If Transfer Callback, Call it
                if (onTransfer != null) onTransfer()
            }
        } catch (error) {
            error = error.message;
        } finally {
            busy = false;
        }
    }

</script>

<div class="flex flex-col items-center justify-center">
    <div class="p-2 text-xl font-semibold">
        {label} Assets
    </div>
    
    <!-- NOTE: Unsure whether passing in callback functions will work to replace React's setState function -->
    <AssetInput
        id={sender.accountId.toString()}
        onChangeAsset={(newAsset) => {asset = newAsset}}
        onChangeAmount={(newAmount) => {amount = newAmount}}
    />

    <div class="p-2" />
    
    <Button 
        disabled={busy} 
        onClick={handleTransfer}
    >
        {label}
    </Button>

    {#if error.length > 0}
        <div class="flex items-center justify-center pt-4 text-sm italic font-semibold w-96">
            <span class="text-red-400">{error}</span>
        </div>
    {/if}

    {#if success.length > 0}
    <div class="flex items-center justify-center pt-4 text-sm italic font-semibold w-96">
        <span class="text-green-400">{success}</span>
    </div>
    {/if}
</div>