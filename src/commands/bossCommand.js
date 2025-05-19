import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import { JsonResponse } from './index.js';


const WEB_HOOK_LIST = {
  1:[],
  2:[],
  3:[],
}

export const getBossWebhookUrl = (server, env) => {
  const config = {
    1: { dcRoleId: '1372770930337775656', webhookUrl: env.BOSS_WEBHOOK_URL_1 },
    2: { dcRoleId: '1372771580018430053', webhookUrl: env.BOSS_WEBHOOK_URL_2 },
    3: { dcRoleId: '1372771022809595986', webhookUrl: env.BOSS_WEBHOOK_URL_3 },
  };

  return config[server] || null;
};

// 新增專用伺服器的Boss命令處理函數
export async function handleBossServerCommand(interaction, env, messageRegistry, userMessages, serverNumber) {
  // 獲取用戶提供的頻道參數
  const options = interaction.data.options || [];
  const channelOption = options.find(opt => opt.name === 'channel');
  const imageOption = options.find(opt => opt.name === 'image');
  
  // 確保提供了必要參數
  if (!channelOption || !imageOption) {
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '😥資料錯誤，請提供正確資訊!',
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
  
  const channel = channelOption.value;
  const server = serverNumber; // 使用函數參數指定的伺服器編號
  
  const dcRoleId = getBossWebhookUrl(server, env)?.dcRoleId;

  // 創建格式化的訊息
  const message = `黑王出現!!
**${channel}** 頻道`;
  
  const hookUrl = getBossWebhookUrl(server, env)?.webhookUrl;
  
  try {
    // 處理圖片附件
    const imageId = imageOption.value;
    const imageUrl = interaction.data.resolved?.attachments?.[imageId]?.url;
    
    if (!imageUrl) {
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '😥無法獲取圖片，請重試!',
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }
    
    // 使用webhook發送訊息
    const response = await fetch(`${hookUrl}?wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
        embeds: [
          {
            image: {
              url: imageUrl
            }
          }
        ]
      }),
    });
    
    if (WEB_HOOK_LIST[server] && WEB_HOOK_LIST[server].length > 0) {
      for (const webhookUrl of WEB_HOOK_LIST[server]) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: message,
            embeds: [
              {
                image: {
                  url: imageUrl
                }
              }
            ]
          }),
        });
      }
    }
    
    const responseJson = await response.json();
    console.log(JSON.stringify(responseJson, null, 2));
    const messageURL = `https://discordapp.com/channels/${env.GUILD_ID}/${responseJson['channel_id']}/${responseJson['id']}`;
  
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
        content: `[已通報${server}服黑王出現](${messageURL})`,
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  } catch (error) {
    if(hookUrl === null) {
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `🚫 **錯誤** : 伺服器${server}設定錯誤`,
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }
    console.error(`處理伺服器${server}黑王通報時出錯:`, error);
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `🚫 **錯誤** : 處理伺服器${server}黑王通報時出錯`,
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
}

