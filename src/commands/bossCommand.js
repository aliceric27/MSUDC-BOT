import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import { JsonResponse } from './index.js';

export const getBossWebhookUrl = (server, env) => {
  switch (server) {
    case 1:
      return env.BOSS_WEBHOOK_URL_1;
    case 2:
      return env.BOSS_WEBHOOK_URL_2;
    case 3:
      return env.BOSS_WEBHOOK_URL_3;
    default:
      return null;
  }
}

export async function handleBossCommand(interaction, env, messageRegistry, userMessages) {

  // 獲取用戶提供的地圖和頻道參數
  const options = interaction.data.options || [];
  const mapOption = options.find(opt => opt.name === 'map');
  const channelOption = options.find(opt => opt.name === 'channel');
  const serverOption = options.find(opt => opt.name === 'server');
  
  // 確保提供了必要參數
  if (!mapOption || !channelOption || !serverOption) {
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '😥資料錯誤，請提供正確資訊!',
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
  
  const map = mapOption.value;
  const channel = channelOption.value;
  const server = serverOption.value;

  // 創建格式化的訊息
  const message = `\`出現黑王 !!\`  [**${map}**](<https://maplestorywiki.net/index.php?search=${map}+map&title=Special%3ASearch&profile=default&fulltext=1>) - **${channel}** ch. `;
  const hookUrl = getBossWebhookUrl(server, env);
  try {
    // 使用webhook發送訊息
    const response = await fetch(`${hookUrl}?wait=true`, {
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
    console.log('responseJson',responseJson);
    
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
    if(hookUrl === null) {
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '😥伺服器編號錯誤!',
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }
    console.error('處理黑王通報時出錯:', error);
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '😥處理黑王通報時出錯',
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
} 

