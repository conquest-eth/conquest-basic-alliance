<script lang="ts">
  import PanelButton from '$lib/components/generic/PanelButton.svelte';
  import {onMount} from 'svelte';
  import Blockie from '$lib/components/account/Blockie.svelte';
  import WalletAccess from '$lib/blockchain/WalletAccess.svelte';
  import {flow, wallet} from '$lib/blockchain/wallet';
  import {Contract} from '@ethersproject/contracts';
  import {hexZeroPad} from '@ethersproject/bytes';
  import {contractsInfos} from '$lib/blockchain/contracts';
  import {formatError} from '$lib/utils';
  import type {WalletData} from 'web3w';

  import messageFlow from '$lib/messages/message';
  import MessageFlow from '$lib/messages/MessageFlow.svelte';
  import Header from '$lib/navigation/header.svelte';
  import {playersQuery} from '$lib/blockchain/playersQuery';
  import {url} from '$lib/utils/url';
  import {BigNumber} from '@ethersproject/bignumber';

  function connect() {
    flow.connect();
  }

  async function join() {
    await flow.execute(async (contracts) => {
      const allianceData = await contracts.AllianceRegistry.callStatic.getAllianceData(wallet.address, id);
      if (allianceData.joinTime.gt(0)) {
        throw new Error('already in alliance');
      }

      let message = `Join Alliance ${hexZeroPad(id.toLowerCase(), 20)}`;
      if (allianceData.nonce.gt(0)) {
        message = `Join Alliance ${hexZeroPad(id.toLowerCase(), 20)} (nonce: ${(
          '' + allianceData.nonce.toNumber()
        ).padStart(10, ' ')})`;
      }
      console.log({message});
      const signature = await wallet.provider.getSigner().signMessage(message);
      signedMessage = wallet.address + ':' + message + `:` + signature;
    });
  }

  async function addMember() {
    await flow.execute(async (contracts) => {
      // TODO do not use : as separator
      const components = joinMessage
        .replace(/^\s+|\s+$/g, '')
        .replace(`nonce:`, 'nonce$')
        .split(':')
        .map((v) => v.replace('nonce$', 'nonce:'));
      let nonce = 0;
      const indexOfNonce = joinMessage.indexOf('nonce:');
      if (indexOfNonce >= 0) {
        // const indexOfClosingParenthesis = joinMessage.indexOf(')');
        const nonceStr = joinMessage.slice(indexOfNonce + 6, indexOfNonce + 6 + 11).trim();
        console.log({nonceStr});
        nonce = parseInt(nonceStr);
      }
      const joinerAddress = components[0];
      const message = components[1];
      const signature = components[2];
      console.log({message, signature});
      const contract = new Contract(
        id,
        $contractsInfos.contracts.BasicAllianceFactory.abi,
        wallet.provider.getSigner()
      );
      await contract.addMembers([
        {
          addr: joinerAddress,
          nonce,
          signature: signature,
        },
      ]);
    });
  }

  let lastWalletState: WalletData | undefined;
  async function update() {
    if (!id) {
      admin = undefined;
      step = 'READY';
      return;
    }
    if (lastWalletState && lastWalletState.state === 'Ready') {
      if (step != 'READY' || (id && !admin)) {
        step = 'LOADING';
        try {
          const contract = new Contract(id, $contractsInfos.contracts.BasicAllianceFactory.abi, wallet.provider);
          admin = (await contract.admin()).toLowerCase();
        } catch (e) {
          step = 'IDLE';
          error = formatError(e);
        }

        if (admin) {
          step = 'READY';
        }
      }
    } else {
      admin = undefined;
      step = 'IDLE';
    }
  }

  let id: string;
  onMount(() => {
    id = location.hash.slice(1);
    update();
  });

  let joinMessage: string | undefined;
  let signedMessage: string | undefined;
  let error: string | undefined;
  let admin: string | undefined;
  let step: 'LOADING' | 'READY' | 'IDLE' = 'IDLE';

  wallet.subscribe(async (walletState) => {
    lastWalletState = walletState;
    update();
  });

  let isAllianceMember = false;
  $: {
    isAllianceMember = false;
    const data = $playersQuery.data;
    const player = data && data.players[$wallet.address?.toLowerCase()];
    if (player) {
      for (const alliance of player.alliances) {
        if (alliance.address == id) {
          isAllianceMember = true;
        }
      }
    }
  }

  $: isAdmin = admin && $wallet.address?.toLowerCase() === admin;
</script>

<Header />

<WalletAccess>
  <div class="py-16 bg-gray-50 overflow-hidden lg:py-24">
    <div class="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
      <div class="relative">Invite</div>

      <div class="m-2">
        {#if $wallet.state !== 'Ready'}
          <!-- <PanelButton on:click={connect} label="Connect">Connect</PanelButton> -->
          <div class="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <PanelButton on:click={connect} label="Connect">Connect Your Wallet</PanelButton>
          </div>
        {:else if step === 'LOADING'}
          <p>Loading ...</p>
        {:else if step === 'IDLE'}
          {#if error}
            {error}
          {/if}
          <PanelButton on:click={() => flow.connect()} label="load">load</PanelButton>
        {:else if !id}
          <!-- nothing -->
        {:else}
          <h2 class="md:text-xl lg-text-2xl text-base text-green-600">
            Members
            <ul>
              {#each $playersQuery.data.alliances[id].members as member}
                <li class="m-2">
                  <Blockie class="inline-block" address={member.address} />
                  {member.address}
                  {#if isAdmin && member.address !== $wallet.address.toLowerCase()}<PanelButton>Kick</PanelButton>{/if}
                </li>
              {/each}
            </ul>
          </h2>
          <div class="w-full border-2 border-black my-2" />
        {/if}
      </div>
    </div>
  </div>
</WalletAccess>
