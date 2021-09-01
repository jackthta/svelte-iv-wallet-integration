<script lang="ts">
    import type { Wallet } from '../domain/wallet'
    import type { Asset } from '../domain/asset';
    import { getBalances, testWallet } from '../service/hedera';
    import { setContext, getContext } from 'svelte';

    import Balances from '../components/Base/Balances.svelte';
    import Button from '../components/Base/Button.svelte';
    import TransferForm from '../components/Base/TransferForm.svelte';

    setContext('BalancesContext', {} as Map<string, Asset[]>)

    // Context
    const userWallet: Wallet = getContext('UserWalletContext');

    // State
    let externalWallet = {} as Wallet;
    let error = null as string | null;
    let keysAssociated = null as boolean | null;
    let balances = new Map() as Map<string, Asset[]>;

    // Handlers
    async function handleConnect(): Promise<void> {
    error = null
    // @ts-ignore
    if (window.wallet != null && userWallet.networkName != null) {
      try {
        // @ts-ignore
        const wallet = window.wallet;
        const account = await wallet.login(userWallet.networkName);
        externalWallet = {
          networkName: userWallet.networkName,
          accountId: account.id,
          publicKey: account.publicKey,
          signer: wallet.getTransactionSigner()
        }
      } catch (error) {
        error = error.message;
      }
    } 
  }

  async function handleFetchBalances(): Promise<void> {
    // Don't want to request signature externally for balance queries
    const proxyExternalWallet = {
      accountId: externalWallet.accountId,
      networkName: userWallet.networkName,
      privateKey: userWallet.privateKey
    }
    
    const newBalances = new Map() as Map<string, Asset[]>;
    newBalances.set(
      userWallet.accountId.toString(),
      await getBalances(userWallet)
    );
    
    if (userWallet.accountId !== proxyExternalWallet.accountId) {
      newBalances.set(
        proxyExternalWallet.accountId.toString(),
        await getBalances(proxyExternalWallet)
      );
    }

    balances = newBalances;
  }

  async function handleVerifyKeys(): Promise<void> {
    error = null;
    keysAssociated = null;

    // Internal Key, External Account
    const crossWallet = {
      networkName: userWallet.networkName,
      accountId: externalWallet.accountId,
      privateKey: userWallet.privateKey
    };
    
    if (userWallet.accountId != null && externalWallet.accountId != null) {
      try {
        await testWallet(userWallet); // Doesn't pass through this
        await testWallet(crossWallet);
        keysAssociated = true;
      } catch (error) {
        error = error.message;
        keysAssociated = false;
      }
    }
  }
</script>

<!-- TO DO: Remove -->
<div class="text-sm bg-yellow-200 text-yellow-900 p-2">
  After connecting to the IV/Infinite wallet, clicking on either the <strong>Is Internal Key Associated With Both Accounts</strong> or <strong>Refresh Balances</strong> button will throw an error if using dynamic imports
</div>

<div class="flex flex-col items-center w-full p-10 justify-items-center">
    <!-- Error display -->
    {#if error != null}
        <div class="p-4 text-2xl font-bold text-red-400">{error}</div>
    {/if}
    
    <div class="flex items-start justify-center w-full">
        <!-- Internal wallet display-->
        <div class="flex flex-col items-center w-96">
            <div class="p-2 text-xl font-semibold">
              Internal Wallet Information
            </div>

            {#if userWallet.accountId != null}
              <div class="flex flex-col items-start w-full h-full p-4 m-4 break-all bg-gray-200 justify-items-center">
                <div class="flex w-full break-normal border border-t-0 border-l-0 border-r-0 border-black"><span class="w-full font-semibold">Network</span>{userWallet.networkName}</div>
                <div class="flex w-full break-normal border border-t-0 border-l-0 border-r-0 border-black"><span class="w-full font-semibold">Account</span>{userWallet.accountId}</div>

                <!-- Private Key -->
                {#if userWallet.privateKey != null}
                      <div class="flex flex-col w-full">
                      <span class="w-full font-semibold">Private Key</span>
                      
                      {userWallet.privateKey}
                      </div>
                  {/if}

                  <!-- Signer -->
                  {#if userWallet.signer != null}
                    <div class="flex flex-col w-full italic font-semibold">External Signer</div>
                  {/if}
                
                  <!-- Public Key -->
                  {#if userWallet.publicKey != null}
                    <div class="flex flex-col w-full">
                      <span class="w-full font-semibold">Public Key</span>
                      
                      {userWallet.publicKey}
                    </div>
                  {/if}
              </div>
            {:else}
                <span>No Wallet Loaded</span>
            {/if}
        </div>
      
        <div class="px-10" />
      
      <!-- External wallet display -->
        <div class="flex flex-col items-center w-96">
            <div class="p-2 text-xl font-semibold">
            External Wallet Information
            </div>

            {#if externalWallet.accountId != null}
              <div class="flex flex-col items-start w-full h-full p-4 m-4 break-all bg-gray-200 justify-items-center">
                <div class="flex w-full break-normal border border-t-0 border-l-0 border-r-0 border-black"><span class="w-full font-semibold">Network</span>{externalWallet.networkName}</div>
                <div class="flex w-full break-normal border border-t-0 border-l-0 border-r-0 border-black"><span class="w-full font-semibold">Account</span>{externalWallet.accountId}</div>

                <!-- Private Key -->
                {#if externalWallet.privateKey != null}
                      <div class="flex flex-col w-full">
                      <span class="w-full font-semibold">Private Key</span>
                      
                      {externalWallet.privateKey}
                      </div>
                  {/if}

                  <!-- Signer -->
                  {#if externalWallet.signer != null}
                    <div class="flex flex-col w-full italic font-semibold">External Signer</div>
                  {/if}
                
                  <!-- Public Key -->
                  {#if externalWallet.publicKey != null}
                    <div class="flex flex-col w-full">
                      <span class="w-full font-semibold">Public Key</span>
                      
                      {externalWallet.publicKey}
                    </div>
                  {/if}
              </div>
            {:else}
                <span>No Wallet Loaded</span>
            {/if}

            <Button onClick={handleConnect} disabled={externalWallet.accountId != null}>
                Connect IV Wallet
            </Button>
        </div>
    </div>
    
    <!-- Controls display -->
    <div class="flex flex-col items-center justify-center w-full m-10">
        {#if userWallet.accountId != null && externalWallet.accountId != null}
            <Button
                onClick={handleVerifyKeys}
                disabled={userWallet.accountId == null || externalWallet.accountId == null}
            >
                Is Internal Key Associated With Both Accounts?
            </Button>
        
            <!-- Keys associated display -->
            {#if keysAssociated != null}
                {#if keysAssociated}
                    <div class="py-2 font-semibold text-green-400">😃 Yup</div>
                {:else}
                    <div class="py-2 font-semibold text-red-400">😅 Nope</div>
                {/if}
            {:else}
                <div class="py-2" />
            {/if}
        
            <Button
                onClick={handleFetchBalances}
                disabled={userWallet.accountId == null || externalWallet.accountId == null}
            >
                Refresh Balances
            </Button>
        {/if}
    </div>

    <!-- Balances and transfers display -->
    {#if balances.get(userWallet.accountId.toString()) != null &&
        balances.get(externalWallet.accountId.toString()) != null }
        <!-- Transfer forms -->
        <div class="flex items-start justify-center w-full">
            {#if keysAssociated}
                {#if userWallet.accountId === externalWallet.accountId}
                    <div class="p-10 italic font-semibold text-red-400">
                        {`Same Account ID (${userWallet.accountId.toString()}) for Internal and External Account. Cannot Transfer Assets.`}
                    </div>
                {/if}
            {/if}

            <TransferForm
                label="Export"
                sender={userWallet}
                recipient={externalWallet}
                onTransfer={handleFetchBalances}
            />
        
            <div class="p-10" />

            <TransferForm
                label="Import"
                sender={externalWallet}
                recipient={userWallet}
                onTransfer={handleFetchBalances}
            />
        </div>

        <!-- Balances display -->
        <div class="flex items-start justify-center w-full pt-6">
            <Balances id={userWallet.accountId.toString()} />

            {#if userWallet.accountId !== externalWallet.accountId }
                <div class="px-10" />
          
                <Balances id={externalWallet.accountId.toString()} />
            {/if}
        </div>
    {/if}
  </div>