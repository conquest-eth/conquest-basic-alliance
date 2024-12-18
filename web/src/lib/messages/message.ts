import {BaseStoreWithData} from '$lib/utils/stores/base';

export type MessageFlow = {
  type: 'MESSAGE';
  step: 'IDLE' | 'LOADING' | 'READY';
  owner?: string;
  profile?: {
    domainDescription?: string;
  };
  error?: {message?: string};
};

const MISSIV_URI = import.meta.env.VITE_MISSIV_URI as string;

class MessageFlowStore extends BaseStoreWithData<MessageFlow, undefined> {
  public constructor() {
    super({
      type: 'MESSAGE',
      step: 'IDLE',
    });
  }

  async show(owner: string): Promise<void> {
    this.setPartial({step: 'LOADING', owner});
    try {
      // TODO CACHE data
      const response = await fetch(`${MISSIV_URI}/api/user/getCompleteUser`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          domain: 'conquest.eth',
          address: owner.toLowerCase(),
        }),
      });
      const json = await response.json();

      if (!json.completeUser) {
        // fallback case to let people connect to player we used the old account-service and where still present on the switch
        if (owner.toLowerCase() === '0x4b9d53246ed18db31f26fc59b6e47a9efc3c1213') {
          this.setPartial({step: 'READY', owner, profile: {domainDescription: 'LukaskywaIker'}});
          return;
        } else if (owner.toLowerCase() === '0x88c0558cb8525c88f78752bb0bdc3e6221597165') {
          this.setPartial({step: 'READY', owner, profile: {domainDescription: 'anar'}});
          return;
        }
      }

      this.setPartial({step: 'READY', owner, profile: json.completeUser});
    } catch (e) {
      this.setPartial({error: e});
    }
  }

  async cancel(): Promise<void> {
    this._reset();
  }

  async acknownledgeSuccess(): Promise<void> {
    this._reset();
  }

  async acknownledgeError(): Promise<void> {
    this.setPartial({error: undefined});
  }

  private _reset() {
    this.setPartial({step: 'IDLE', owner: undefined});
  }
}

export default new MessageFlowStore();
