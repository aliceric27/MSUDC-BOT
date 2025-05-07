/**
 * The core server that runs on a Cloudflare worker.
 */

import { AutoRouter } from 'itty-router';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { BOSS_COMMAND, GMS_SEARCH_COMMAND } from './commands.js';
// import { getCuteUrl } from './reddit.js';
import { InteractionResponseFlags } from 'discord-interactions';

class JsonResponse extends Response {
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

const router = AutoRouter();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env,
  );
  console.log(isValid, interaction);
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.PING) {
    // The `PING` message is used during the initial webhook handshake, and is
    // required to configure the webhook in the developer portal.
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    // Most user commands will come as `APPLICATION_COMMAND`.
    switch (interaction.data.name.toLowerCase()) {
      // case AWW_COMMAND.name.toLowerCase(): {
      //   const cuteUrl = await getCuteUrl();
      //   return new JsonResponse({
      //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      //     data: {
      //       content: cuteUrl,
      //     },
      //   });
      // }
      // case INVITE_COMMAND.name.toLowerCase(): {
      //   const applicationId = env.DISCORD_APPLICATION_ID;
      //   const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=applications.commands`;
      //   return new JsonResponse({
      //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      //     data: {
      //       content: INVITE_URL,
      //       flags: InteractionResponseFlags.EPHEMERAL,
      //     },
      //   });
      // }
      case BOSS_COMMAND.name.toLowerCase(): {
        // 獲取用戶提供的地圖和頻道參數
        const options = interaction.data.options || [];
        const mapOption = options.find(opt => opt.name === 'map');
        const channelOption = options.find(opt => opt.name === 'channel');
        
        // 確保提供了必要參數
        if (!mapOption || !channelOption) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '請提供地圖名稱和頻道號碼',
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
        
        const map = mapOption.value;
        const channel = channelOption.value;
        
        // 獲取當前時間並格式化
        const now = new Date();
        const formattedTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // 創建格式化的訊息
        const message = `<t:1746599460:t>出現黑王 !!  [**${map}**](<https://maplestorywiki.net/index.php?search=${map}+map&title=Special%3ASearch&profile=default&fulltext=1>) - **${channel}** ch. `;
        
        try {
          // 使用webhook發送訊息
          const response = await fetch(`${env.BOSS_WEBHOOK_URL}?wait=true`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: message,
            }),
          });
          
          if (!response.ok) {
            console.error('發送訊息到webhook失敗:', await response.text());
            return new JsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: '發送黑王通報失敗，請聯繫管理員',
                flags: InteractionResponseFlags.EPHEMERAL,
              },
            });
          }
          
          // 回應用戶的命令
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `已通報黑王出現於 ${map} - ${channel}ch`,
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        } catch (error) {
          console.error('處理黑王通報時出錯:', error);
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '處理黑王通報時出錯',
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
      }
      case GMS_SEARCH_COMMAND.name.toLowerCase(): {
        // 獲取用戶提供的關鍵字參數
        const options = interaction.data.options || [];
        const keywordOption = options.find(opt => opt.name === 'keyword');
        
        // 確保提供了必要參數
        if (!keywordOption) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '請提供搜尋關鍵字',
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
        
        const keyword = keywordOption.value;
        
        // 對關鍵字進行 URL 編碼
        const encodedKeyword = encodeURIComponent(keyword);
        
        // 創建搜尋 URL
        const searchUrl = `https://maplestory.wiki/GMS/210.1.1/quest?page=1&searchFor=${encodedKeyword}`;
        
        // 回應用戶的命令
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `**${keyword}** 的搜尋結果：${searchUrl}`,
            flags: InteractionResponseFlags.EPHEMERAL
          },
        });
      }
      default:
        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
    }
  }

  console.error('Unknown Type');
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest(request, env) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
  if (!isValidRequest) {
    return { isValid: false };
  }

  return { interaction: JSON.parse(body), isValid: true };
}

const server = {
  verifyDiscordRequest,
  fetch: router.fetch,
};

export default server;
