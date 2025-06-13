import { InteractionResponseType, InteractionResponseFlags } from 'discord-interactions';
import { JsonResponse } from './index.js';

// 處理 NFT 查詢的自動完成功能
export async function handleQueryNftsAutocomplete(interaction) {
  const focusedOption = interaction.data.options.find(opt => opt.focused);
  if (!focusedOption) {
    return new JsonResponse({
      type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: []
      }
    });
  }

  let choices = [];

  if (focusedOption.name === '子分類-1') {
    // 查找類型選項
    const typeOption = interaction.data.options.find(opt => opt.name === '類型');
    if (!typeOption) return getEmptyChoicesResponse();

    const cateValue = typeOption.value;
    const choicesMapping = {
      '10': [
        { name: '單手武器', value: '10' },
        { name: '雙手武器', value: '20' },
        { name: '副武', value: '30' },
      ],
      '20': [
        { name: "防具", value: "10" },
        { name: "飾品", value: "20" }
      ],
      '30': [
        { name: "服裝", value: "10" },
        { name: "美容", value: "20" },
      ],
      '40': [
        { name: "寵物", value: "10" }
      ],
      '50': [
        { name: "椅子", value: "10" },
        { name: "坐騎", value: "20" },
        { name: "傷害皮膚", value: "30" },
        { name: "箭矢、飛鏢和子彈", value: "40" }
      ]
    };
    choices = choicesMapping[cateValue] || [];
  } else if (focusedOption.name === '子分類-2') {
    // 查找類型和子分類-1選項
    const typeOption = interaction.data.options.find(opt => opt.name === '類型');
    const subType1Option = interaction.data.options.find(opt => opt.name === '子分類-1');
    if (!typeOption || !subType1Option) return getEmptyChoicesResponse();

    const cateValue = typeOption.value;
    const subCateValue = subType1Option.value;
    
    const choicesMapping = {
      '10': {
        '10': [
          { name: '單手劍', value: '01' },
          { name: '單手斧', value: '02' },
          { name: '單手鈍器', value: '03' },
          { name: '匕首', value: '04' },
          { name: '魔杖', value: '05' },
          { name: '法杖', value: '06' },
        ],
        '20': [
          { name: '雙手劍', value: '01' },
          { name: '雙手斧', value: '02' },
          { name: '雙手鈍器', value: '03' },
          { name: '矛', value: '04' },
          { name: '槍', value: '05' },
          { name: '弓', value: '06' },
          { name: '弩', value: '07' },
          { name: '拳套', value: '08' },
          { name: '指虎', value: '09' },
          { name: '槍', value: '10' },
        ],
        '30': [
          { name: "勳章", value: "01" },
          { name: "念珠", value: "02" },
          { name: "鐵鍊", value: "03" },
          { name: "魔法書", value: "04" },
          { name: "箭羽", value: "05" },
          { name: "弓臂塊", value: "06" },
          { name: "匕首鞘", value: "07" },
          { name: "護符", value: "08" },
          { name: "腕帶", value: "09" },
          { name: "遠望", value: "10" }
        ],
      },
      '20': {
        "10": [
          { name: "帽子", value: "01" },
          { name: "上衣", value: "02" },
          { name: "套裝", value: "03" },
          { name: "褲子", value: "04" },
          { name: "鞋子", value: "05" },
          { name: "手套", value: "06" },
          { name: "披風", value: "07" },
        ],
        "20": [
          { name: "臉部飾品", value: "01" },
          { name: "眼部飾品", value: "02" },
          { name: "耳環", value: "03" },
          { name: "戒指", value: "04" },
          { name: "墜飾", value: "05" },
          { name: "腰帶", value: "06" },
          { name: "肩部飾品", value: "07" },
          { name: "口袋物品", value: "08" },
          { name: "徽章", value: "09" },
          { name: "紋章", value: "10" }
        ]
      },
      "40": {
        "10": [
          { name: "帽子", value: "01" },
          { name: "上衣", value: "02" },
          { name: "套裝", value: "03" },
          { name: "褲子", value: "04" },
          { name: "鞋子", value: "05" },
          { name: "手套", value: "06" },
          { name: "披風", value: "07" },
          { name: "臉部飾品", value: "08" },
          { name: "眼部飾品", value: "09" },
          { name: "耳環", value: "10" },
          { name: "戒指", value: "11" },
          { name: "武器", value: "12" },
          { name: "寵物裝備", value: "13" },
        ],
        "20": [
          { name: "臉部", value: "01" },
          { name: "髮型", value: "02" },
          { name: "皮膚", value: "03" }
        ]
      },
      "50": {
        "40": [
          { name: "弓箭", value: "01" },
          { name: "弩箭", value: "02" },
          { name: "飛鏢", value: "03" },
          { name: "子彈", value: "04" }
        ]
      }
    };
    choices = choicesMapping[cateValue]?.[subCateValue] || [];
  }

  return new JsonResponse({
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: {
      choices
    }
  });
}

function getEmptyChoicesResponse() {
  return new JsonResponse({
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: {
      choices: []
    }
  });
}

// 處理 NFT 查詢命令
export async function handleQueryNftsCommand(interaction, env) {
  // 設定延遲回覆，因為可能需要較長時間處理
  const deferResponse = new JsonResponse({
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.EPHEMERAL
    }
  });
  
  try {
    // 取得各選項的值
    const options = interaction.data.options || [];
    const equipNameOption = options.find(opt => opt.name === '裝備名稱');
    const equipTypeOption = options.find(opt => opt.name === '類型');
    const subType1Option = options.find(opt => opt.name === '子分類-1');
    const subType2Option = options.find(opt => opt.name === '子分類-2');
    const minPriceOption = options.find(opt => opt.name === '最小價格');
    const maxPriceOption = options.find(opt => opt.name === '最大價格');

    const equipName = equipNameOption?.value;
    const equipType = equipTypeOption?.value;
    const subType1 = subType1Option?.value || '00';
    const subType2 = subType2Option?.value || '00';
    const minPrice = minPriceOption?.value || 0;
    const maxPrice = maxPriceOption?.value || 10000000000;

    const filter = {
      categoryNo: 0,
      potential: {
        min: 0,
        max: 4
      },
      bonusPotential: {
        min: 0,
        max: 4
      },
      starforce: {
        min: 0,
        max: 25
      },
      level: {
        min: 0,
        max: 250
      },
      pirce: {
        min: minPrice,
        max: maxPrice
      }
    };

    if (equipName) {
      filter.name = equipName;
    }

    if (equipType) {
      const categoryNoString = "1000" + equipType + subType1 + subType2;
      filter.categoryNo = parseInt(categoryNoString);
    }

    const response = await fetch('https://msu.io/marketplace/api/marketplace/explore/items', {
      method: 'POST',
      headers: {
        'Host': 'msu.io',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome'
      },
      body: JSON.stringify({
        filter,
        "paginationParam": {
          "pageNo": 1,
          "pageSize": 5
        },
        "sorting": "ExploreSorting_LOWEST_PRICE",
      })
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error('Error:', errorMessage);
      console.error('Status Code:', response.status);
      
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "查詢失敗，請稍後再試或聯絡管理員",
          flags: InteractionResponseFlags.EPHEMERAL
        }
      });
    }

    const responseData = await response.json();
    const resultData = parseMsuItemsResponse(responseData);

    // 構建回覆嵌入消息
    const embeds = [];
    for (const item of resultData) {
      embeds.push({
        title: item.equipName,
        fields: [
          { name: '價格', value: item.price }
        ],
        image: { url: item.imageUrl },
        url: `https://msu.io/marketplace/nft/${item.tokenId}`
      });
    }

    // 返回結果
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds,
        flags: InteractionResponseFlags.EPHEMERAL
      }
    });
  } catch (error) {
    console.error('處理 NFT 查詢時出錯:', error);
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "處理查詢時發生錯誤，請稍後再試",
        flags: InteractionResponseFlags.EPHEMERAL
      }
    });
  }
}

// 解析 MSU 項目回應
function parseMsuItemsResponse(response) {
  const resultData = response.items.map(item => ({
    equipName: item.name,
    price: weiToEther(item.salesInfo.priceWei),
    imageUrl: item.imageUrl,
    tokenId: item.tokenId,
  }));
  return resultData;
}

// 將 Wei 轉換為 Ether
function weiToEther(wei) {
  const ether = wei / 1e18;
  return ether.toString().trimEnd('0');
} 