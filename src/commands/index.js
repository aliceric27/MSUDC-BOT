export class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
    super(jsonBody, init);
  }
}

export { handleBossServerCommand } from './bossCommand.js';
export { handleGmsSearchCommand } from './gmsSearchCommand.js';
export { handleQueryNftsCommand, handleQueryNftsAutocomplete } from './querynfts.js';
export { handleRewardAvgCommand } from './rewardAvgCommand.js';