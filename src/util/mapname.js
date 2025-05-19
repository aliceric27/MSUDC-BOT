/**
 * 地圖名稱映射表
 * 格式：{ [英文簡寫]: 中文地圖名稱 }
 */

const MAP_NAME_MAPPINGS = {
  // 各地圖簡寫對應的中文名稱
  'cafe-2f-1':'140~149 咖啡機 2F-1 (2F Cafe <1>)',
  'cafe-2f-4': '150~159 咖啡機 2F-4 (2F Cafe <4>)',
  'arts-entertainment-3f-4': '150~159 筆記本 3F-4 (3F Arts & Entertainment Shops <4>)',
  'cosmetics-5f-4': '160~169 化妝台 5F-4 (5F Cosmetics Shops <4>)',
  'dark-spore-hill': '160~169 邪惡姑姑寶貝 (Dark Spore Hill)',
  'omega-boswell-field-2': '160~169 地球防衛總部三眼章魚飛碟 (Omega Sector Boswell Field II)',
  'corridor-204': '170 ~ 179 地球防衛總部  外星人飛碟 (Corridor 204)',
  'forest-of-pain-1': '170 ~ 179 藍刀 (Forest of Pain 1)',
  'forest-of-sorrows-1': '180 ~ 189 紫刀怪 (Kingdom Road: Forest of Sorrows 1)',
  'twilight-perion-excavation-2': '190 ~ 199 黃昏勇士之村 - 挖掘地2 (Twilight Perion Forsaken Excavation Site 2)',
  // 可以在此處添加更多地圖名稱映射
};

/**
 * 中文簡稱到英文簡寫的映射表
 * 用於處理用戶輸入的簡稱
 */
const CHINESE_TO_ENGLISH_MAP = {
  // 常用簡稱
  '咖啡機': 'cafe-2f-1',
  '咖啡機1': 'cafe-2f-1',
  '咖啡機2f1': 'cafe-2f-1',
  '咖啡機4': 'cafe-2f-4',
  '咖啡機2f4': 'cafe-2f-4',
  '筆記本': 'arts-entertainment-3f-4',
  '筆記本3f4': 'arts-entertainment-3f-4',
  '化妝台': 'cosmetics-5f-4',
  '化妝台5f4': 'cosmetics-5f-4',
  '姑姑': 'dark-spore-hill',
  '姑姑寶貝': 'dark-spore-hill',
  '邪惡姑姑': 'dark-spore-hill',
  '章魚': 'omega-boswell-field-2',
  '三眼章魚': 'omega-boswell-field-2',
  '飛碟': 'corridor-204',
  '外星人': 'corridor-204',
  '外星人飛碟': 'corridor-204',
  '204': 'corridor-204',
  '藍刀': 'forest-of-pain-1',
  '痛苦森林': 'forest-of-pain-1',
  '紫刀': 'forest-of-sorrows-1',
  '紫刀怪': 'forest-of-sorrows-1',
  '哭哭森林': 'forest-of-sorrows-1',
  '挖2': 'twilight-perion-excavation-2',
  '挖掘地2': 'twilight-perion-excavation-2',
  '挖掘': 'twilight-perion-excavation-2'
};

// 地圖圖片映射表，用於設定每個地圖的特定圖片URL
const MAP_IMAGE_MAPPINGS = {
  'cafe-2f-1': 'https://i.meee.com.tw/Zp6a7MC.png',
  'cafe-2f-4': 'https://i.meee.com.tw/CqB1HXy.png',
  'arts-entertainment-3f-4': 'https://i.meee.com.tw/aDtFNS0.png',
  'cosmetics-5f-4': 'https://i.meee.com.tw/uoDiMWv.png',
  'dark-spore-hill': 'https://i.meee.com.tw/0wHMaQh.png',
  'omega-boswell-field-2': 'https://i.meee.com.tw/MFLBdUA.png',
  'corridor-204': 'https://i.meee.com.tw/qabDoKk.png',
  'forest-of-pain-1': 'https://i.meee.com.tw/XQU6s8I.png',
  'forest-of-sorrows-1': 'https://i.meee.com.tw/GSxZlal.png',
  'twilight-perion-excavation-2': 'https://i.meee.com.tw/zNxNuRL.png'
};

/**
 * 將地圖值轉換為包含完整信息的對象
 * @param {string} mapValue - 從 commands 傳入的地圖值
 * @returns {Object} - 包含 name、value 和 img 的對象
 */
export function translateMapName(mapValue) {
  if (!mapValue) return { name: "", value: "", img: "" };
  
  // 處理輸入，將其轉換為小寫並去除前後空白
  const normalizedInput = mapValue.trim().toLowerCase();
  
  // 首先檢查是否為中文簡稱，如果是則轉換為英文簡寫
  const englishKey = CHINESE_TO_ENGLISH_MAP[normalizedInput] || mapValue;
  
  // 獲取地圖對應的名稱，如果沒有則使用 englishKey 本身
  const name = MAP_NAME_MAPPINGS[englishKey] || englishKey;
  
  // 獲取圖片 URL
  const imgUrl = MAP_IMAGE_MAPPINGS[englishKey] || 
                `https://example.com/maps/default.jpg`;
  
  // 返回結果對象
  return {
    name: name,
    value: englishKey,
    img: imgUrl
  };
}

/**
 * 獲取完整的地圖名稱映射表
 * @returns {Object} - 包含所有映射的對象
 */
export function getMapNameMappings() {
  return {
    englishToChinese: { ...MAP_NAME_MAPPINGS },
    chineseToEnglish: { ...CHINESE_TO_ENGLISH_MAP }
  };
}
