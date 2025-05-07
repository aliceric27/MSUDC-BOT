/**
 * The core server that runs on a Cloudflare worker.
 */

import { AutoRouter } from 'itty-router';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { 
  BOSS_COMMAND, 
  GMS_SEARCH_COMMAND, 
  DELETE_MESSAGE_COMMAND,
  LIST_MESSAGES_COMMAND,
  DELETE_ALL_MESSAGES_COMMAND
} from './commands.js';
// import { getCuteUrl } from './reddit.js';
import { InteractionResponseFlags } from 'discord-interactions';

// 使用KV存儲或內存存儲來記錄訊息與用戶的對應關係
const messageRegistry = new Map(); // messageId -> messageInfo
const userMessages = new Map();   // userId -> Set of messageIds

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
        // 創建格式化的訊息
        const message = `\`出現黑王 !!\`  [**${map}**](<https://maplestorywiki.net/index.php?search=${map}+map&title=Special%3ASearch&profile=default&fulltext=1>) - **${channel}** ch. `;
        
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
          const responseJson = await response.json();
          console.log(JSON.stringify(responseJson, null, 2));
          const messageId = responseJson.id;
          
          // 記錄使用者ID與訊息ID的對應關係
          const userId = interaction.member.user.id;
          console.log('responseJson',responseJson)
          messageRegistry.set(messageId, {
            userId,
            webhookId: responseJson.webhook_id,
            channelId: responseJson.channel_id,
            timestamp: new Date().toISOString(),
            content: responseJson.content
          });
          
          // 更新使用者發送的訊息集合
          if (!userMessages.has(userId)) {
            userMessages.set(userId, new Set());
          }
          userMessages.get(userId).add(messageId);
          
          console.log(`已記錄訊息: ${messageId}, 用戶: ${userId}`);
        
          if (!response.ok) {
            console.error('發送訊息到webhook失敗:', await response.clone().text());
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
              content: `已通報黑王出現於 ${map} - ${channel}ch\n訊息ID: \`${messageId}\``,
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
      case DELETE_MESSAGE_COMMAND.name.toLowerCase(): {
        // 獲取用戶提供的訊息ID參數
        const options = interaction.data.options || [];
        const messageIdOption = options.find(opt => opt.name === 'messageid');
        
        // 確保提供了必要參數
        if (!messageIdOption) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '請提供要刪除的訊息ID',
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
        
        const messageId = messageIdOption.value;
        const userId = interaction.member.user.id;
        
        // 檢查訊息是否存在且是由該用戶發送
        const messageInfo = messageRegistry.get(messageId);
        
        if (!messageInfo) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '找不到此訊息ID的紀錄',
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
        
        // 可選：檢查是否為原始發送者或管理員
        if (messageInfo.userId !== userId) {
          // 檢查是否為使用者，如果不是則拒絕
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '您無權刪除此訊息',
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
        
        try {
          // 使用Discord Webhook API刪除訊息
          // 格式: DELETE /webhooks/{webhook.id}/{webhook.token}/messages/{message.id}
          const response = await fetch(`${env.BOSS_WEBHOOK_URL}/messages/${messageId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            console.error('刪除訊息失敗:', await response.text());
            return new JsonResponse({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: '刪除訊息失敗，請聯繫管理員',
                flags: InteractionResponseFlags.EPHEMERAL,
              },
            });
          }
          
          // 從記錄中刪除訊息
          messageRegistry.delete(messageId);
          
          // 從用戶訊息集合中移除
          if (messageInfo && userMessages.has(messageInfo.userId)) {
            userMessages.get(messageInfo.userId).delete(messageId);
            // 如果集合為空，刪除整個集合
            if (userMessages.get(messageInfo.userId).size === 0) {
              userMessages.delete(messageInfo.userId);
            }
          }
          
          // 回應用戶的命令
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `已成功刪除訊息(ID: ${messageId})`,
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        } catch (error) {
          console.error('處理刪除訊息時出錯:', error);
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '處理刪除訊息時出錯',
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
      }
      case LIST_MESSAGES_COMMAND.name.toLowerCase(): {
        const userId = interaction.member.user.id;
        
        // 檢查用戶是否有發送過訊息
        if (!userMessages.has(userId) || userMessages.get(userId).size === 0) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '您目前沒有任何記錄的訊息',
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
        
        // 獲取用戶的所有訊息ID
        const messageIds = Array.from(userMessages.get(userId));
        const messageDetails = messageIds.map(messageId => {
          const info = messageRegistry.get(messageId);
          if (!info) return `- \`${messageId}\` (無詳細資訊)`;
          
          // 格式化時間為當地時間字符串
          const timestamp = new Date(info.timestamp);
          const formattedTime = timestamp.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          
          return `- \`${messageId}\` (發送時間: ${formattedTime}) ${info.content}`;
        });
        
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `### 您的訊息列表 (共 ${messageIds.length} 條)\n${messageDetails.join('\n')}\n\n使用 \`/deletemessage messageid:訊息ID\` 可刪除單條訊息\n使用 \`/deleteallmessages\` 可刪除所有訊息`,
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }
      case DELETE_ALL_MESSAGES_COMMAND.name.toLowerCase(): {
        const userId = interaction.member.user.id;
        
        // 檢查用戶是否有發送過訊息
        if (!userMessages.has(userId) || userMessages.get(userId).size === 0) {
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '您目前沒有任何記錄的訊息可供刪除',
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
        
        // 獲取用戶的所有訊息ID
        const messageIds = Array.from(userMessages.get(userId));
        const totalMessages = messageIds.length;
        let successCount = 0;
        let failedCount = 0;
        
        try {
          // 使用Promise.all批量發送刪除請求
          const deleteResults = await Promise.all(
            messageIds.map(async (messageId) => {
              try {
                const response = await fetch(`${env.BOSS_WEBHOOK_URL}/messages/${messageId}`, {
                  method: 'DELETE',
                });
                
                if (response.ok) {
                  successCount++;
                  return { success: true, messageId };
                } else {
                  failedCount++;
                  console.error(`刪除訊息失敗 (ID: ${messageId}):`, await response.text());
                  return { success: false, messageId, error: response.statusText };
                }
              } catch (error) {
                failedCount++;
                console.error(`刪除訊息異常 (ID: ${messageId}):`, error);
                return { success: false, messageId, error: error.message };
              }
            })
          );
          
          // 清空用戶的訊息記錄
          userMessages.delete(userId);
          
          // 清除messageRegistry中的相關記錄
          messageIds.forEach(messageId => {
            messageRegistry.delete(messageId);
          });
          
          // 回應用戶
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `已處理刪除請求：${successCount}/${totalMessages} 條訊息刪除成功${failedCount > 0 ? `，${failedCount} 條失敗` : ''}`,
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        } catch (error) {
          console.error('批量刪除訊息時出錯:', error);
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '處理批量刪除請求時出錯',
              flags: InteractionResponseFlags.EPHEMERAL,
            },
          });
        }
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
