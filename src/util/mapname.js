/**
 * 地圖名稱映射表
 * 格式：{ [中文名稱]: 英文名稱 }
 */
const MAP_NAME_MAPPINGS = {
  // 挖掘地2的各種中文表達方式
  '挖2': 'Twilight Perion Forsaken Excavation Site 2',
  '挖二': 'Twilight Perion Forsaken Excavation Site 2',
  '挖掘地2': 'Twilight Perion Forsaken Excavation Site 2',
  '204':  'Inside the Mothership Corridor 204',
  '紫刀': 'Kingdom Road Forest of Sorrows 1',
  '哭哭森林1': 'Kingdom Road Forest of Sorrows 1',
  '森1': 'Kingdom Road Forest of Sorrows 1',
  '洛斯威爾草原2': 'Omega Sector Boswell Field II',
  '草2': 'Omega Sector Boswell Field II',
  // 可以在此處添加更多地圖名稱映射
};

/**
 * 將中文地圖名稱轉換為英文地圖名稱
 * @param {string} mapName - 中文地圖名稱
 * @returns {string} - 對應的英文地圖名稱，如果沒有對應則返回原名稱
 */
export function translateMapName(mapName) {
  if (!mapName) return mapName;
  
  // 移除所有空格並進行一致性比較
  const normalizedName = mapName.trim();
  
  // 從映射表中查找對應的英文名稱
  return MAP_NAME_MAPPINGS[normalizedName] || mapName;
}

/**
 * 獲取完整的地圖名稱映射表
 * @returns {Object} - 地圖名稱映射表
 */
export function getMapNameMappings() {
  return { ...MAP_NAME_MAPPINGS };
}
