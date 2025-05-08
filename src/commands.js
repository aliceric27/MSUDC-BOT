/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

export const AWW_COMMAND = {
  name: 'awwww',
  description: 'Drop some cuteness on this channel.',
};

export const INVITE_COMMAND = {
  name: 'invite',
  description: 'Get an invite link to add the bot to your server',
};

export const BOSS_COMMAND = {
  name: 'bossreport',
  description: '通報你發現的BOSS',
  options: [
    {
      type: 4, // STRING type
      name: 'server',
      description: '請輸入伺服器編號 ex:1,2,3',
      required: true,
    },
    {
      type: 3, // STRING type
      name: 'map',
      description: '請輸入地圖名稱',
      required: true,
    },
    {
      type: 4, // INTEGER type
      name: 'channel',
      description: '請輸入頻道號碼',
      required: true,
    }
  ],
};

export const GMS_SEARCH_COMMAND = {
  name: 'gmssearch',
  description: '任務、道具查詢(GMS)',
  options: [
    {
      type: 3, // STRING type
      name: 'keyword',
      description: '請輸入關鍵字',
      required: true,
    }
  ],
};

export const DELETE_MESSAGE_COMMAND = {
  name: 'deletemessage',
  description: '刪除由機器人發送的訊息',
  options: [
    {
      type: 3, // STRING type
      name: 'messageid',
      description: '請輸入訊息ID',
      required: true,
    }
  ],
};

export const LIST_MESSAGES_COMMAND = {
  name: 'listmessages',
  description: '列出您發送的所有訊息',
};

export const DELETE_ALL_MESSAGES_COMMAND = {
  name: 'deleteallmessages',
  description: '刪除您發送的所有訊息',
};

