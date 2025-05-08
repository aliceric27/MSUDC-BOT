import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import { JsonResponse } from './index.js';
import { getBossWebhookUrl } from './bossCommand.js';

export async function handleDeleteAllMessagesCommand(interaction, env, messageRegistry, userMessages) {
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
          const response = await fetch(`${getBossWebhookUrl(server)}/messages/${messageId}`, {
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