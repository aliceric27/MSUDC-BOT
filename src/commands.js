/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */




// 新增三個專用伺服器的BOSS命令
export const BOSS1_COMMAND = {
  name: 'boss1',
  description: '通報1服黑王BOSS',
  options: [
    {
      type: 4, // INTEGER type
      name: 'channel',
      min_value:1,
      max_value:20,
      description: '請輸入頻道號碼1~20',
      required: true,
    },
    {
      type: 11,
      name: 'image',
      description: '上傳圖片',
      required: true
    }
  ],
};

export const BOSS2_COMMAND = {
  name: 'boss2',
  description: '通報2服黑王BOSS',
  options: [
    {
      type: 4, // INTEGER type
      name: 'channel',
      min_value:1,
      max_value:20,
      description: '請輸入頻道號碼1~20',
      required: true,
    },
    {
      type: 11,
      name: 'image',
      description: '上傳圖片',
      required: true
    }
  ],
};

export const BOSS3_COMMAND = {
  name: 'boss3',
  description: '通報3服黑王BOSS',
  options: [
    {
      type: 4, // INTEGER type
      name: 'channel',
      min_value:1,
      max_value:20,
      description: '請輸入頻道號碼1~20',
      required: true,
    },
    {
      type: 11,
      name: 'image',
      description: '上傳圖片',
      required: true
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


