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
    },
    {
      type: 3,
      name: 'text',
      description: '輸入備註',
      required: false
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
    },
    {
      type: 3,
      name: 'text',
      description: '輸入備註',
      required: false
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
    },
    {
      type: 3,
      name: 'text',
      description: '輸入備註',
      required: false
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

export const NFT_SEARCH_COMMAND = {
  name: 'querynfts',
  description: '查詢 NFT 最低價格前十筆資料',
  options: [
    {
      type: 3, // STRING type
      name: '裝備名稱',
      description: '裝備名稱 (請輸入英文名稱)',
      required: false,
    },
    {
      type: 3, // STRING type
      name: '類型',
      description: '請根據選項輸入裝備類型，不輸入為全選擇',
      required: false,
      choices: [
        { name: '武器', value: '10' },
        { name: '防具', value: '20' },
        { name: '時裝', value: '30' },
        { name: '工具', value: '40' },
        { name: '其他', value: '50' },
      ]
    },
    {
      type: 3, // STRING type
      name: '子分類-1',
      description: '類型的子分類，請先選擇類型',
      required: false,
      autocomplete: true,
    },
    {
      type: 3, // STRING type
      name: '子分類-2',
      description: '子分類-1的子分類，請先選擇子分類-1',
      required: false,
      autocomplete: true,
    },
    {
      type: 10, // NUMBER type
      name: '最小價格',
      description: '請輸入數字',
      required: false,
      min_value: 0,
      max_value: 10000000000,
    },
    {
      type: 10, // NUMBER type
      name: '最大價格',
      description: '請輸入數字',
      required: false,
      min_value: 0,
      max_value: 10000000000,
    }
  ],
};

export const REWARD_AVG_COMMAND = {
  name: 'rewardavg',
  description: 'BOSS 獎勵平均分配計算，使用 Wrap 計算，注意: 手續費會浮動，請自行評估使用',
  options: [
    {
      type: 4, // INTEGER type
      name: 'people',
      description: '參與人數',
      required: true,
      min_value: 1,
      max_value: 6,
    },
    {
      type: 10, // NUMBER type
      name: 'totalreward',
      description: 'BOSS 獎勵總額(單位: NESO)',
      required: true,
      min_value: 0,
      max_value: 10000000000,
    },
    {
      type: 10, // NUMBER type
      name: 'basefee',
      description: '基本手續費(單位: NXPC)，預設為 0.001',
      required: false,
    },
    {
      type: 10, // NUMBER type
      name: 'extrafee',
      description: '額外手續費(單位: NXPC)，預設為 0.025',
      required: false,
    },
    {
      type: 10, // NUMBER type
      name: 'swaprate',
      description: 'NXPC 換 NESO 的比率，預設為 100000',
      required: false,
    },
    {
      type: 5, // BOOLEAN type
      name: 'detail',
      description: '顯示詳細計算過程',
      required: false,
    }
  ],
};


