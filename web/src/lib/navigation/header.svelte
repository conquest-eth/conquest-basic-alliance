<script lang="ts">
  import {flow, wallet} from '$lib/blockchain/wallet';
  import PanelButton from '$lib/components/generic/PanelButton.svelte';
  import {url} from '$lib/utils/url';

  export let home: boolean = false;

  function connect() {
    flow.connect();
  }
  function disconnect() {
    wallet.disconnect();
  }
</script>

<nav class="bg-white shadow">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex">
        {#if !home}
          <PanelButton href={url('/')}>Home</PanelButton>
        {/if}
      </div>
      <div class="sm:ml-6 sm:flex sm:items-center">
        {#if $wallet.state !== 'Ready'}
          <PanelButton on:click={connect} label="Connect">Connect</PanelButton>
        {:else}
          <PanelButton class="float-right" on:click={disconnect} label="Disconnect">Disconnect</PanelButton>
        {/if}
      </div>
    </div>
  </div>
</nav>
