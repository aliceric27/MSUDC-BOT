import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import { JsonResponse } from './index.js';
import { getBossWebhookUrl } from './bossCommand.js';
export async function handleDeleteMessageCommand(interaction, env, messageRegistry, userMessages) {
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
    const response = await fetch(`${getBossWebhookUrl(server)}/messages/${messageId}`, {
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