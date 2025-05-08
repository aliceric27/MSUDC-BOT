import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import { JsonResponse } from './index.js';


export async function handleGmsSearchCommand(interaction, env, messageRegistry, userMessages) {
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
      content: `[**${keyword}**](${searchUrl}) 已成功搜尋`,
      flags: InteractionResponseFlags.EPHEMERAL
    },
  });
} 