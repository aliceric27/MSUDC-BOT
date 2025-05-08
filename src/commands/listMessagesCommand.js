import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import { JsonResponse } from './index.js';

export async function handleListMessagesCommand(interaction, env, messageRegistry, userMessages) {
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