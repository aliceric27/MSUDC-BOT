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

export async function handleBossCommand(interaction, env) {

  // 獲取用戶提供的地圖和頻道參數
  const options = interaction.data.options || [];
  const mapOption = options.find(opt => opt.name === 'map');
  const channelOption = options.find(opt => opt.name === 'channel');
  const serverOption = options.find(opt => opt.name === 'server');

  console.log('env',env);
  
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
  const message = ` [**${map}**](<https://maplestorywiki.net/index.php?search=${map}+map&title=Special%3ASearch&profile=default&fulltext=1>) - **${channel}** ch. 發現黑王`;
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
        content: `[已通報黑王出現](${messageURL})`,
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  } catch (error) {
    if(hookUrl === null) {
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '🚫 **錯誤** : 伺服器編號錯誤',
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }
    console.error('處理黑王通報時出錯:', error);
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: '🚫 **錯誤** : 處理黑王通報時出錯',
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
} 

