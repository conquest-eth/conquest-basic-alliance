import {wallet} from '$lib/blockchain/wallet';
import {derived} from 'svelte/store';
import type {WalletStore} from 'web3w';

export type AccountState = {
  ownerAddress?: string;
};

export const account = derived<[WalletStore], AccountState>([wallet], ([$wallet]) => {
  return {
    ownerAddress: $wallet.address?.toLowerCase(),
  };
});
