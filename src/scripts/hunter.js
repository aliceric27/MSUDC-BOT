#!/usr/bin/env node
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function updateFiles() {
  try {
    // 更新 register.js 中的環境變數路徑
    const registerPath = 'src/register.js';
    let registerContent = await fs.readFile(registerPath, 'utf8');
    registerContent = registerContent.replace(
      /dotenv\.config\(\{\s*path:\s*['"].+['"]\s*\}\);/,
      'dotenv.config({ path: \'.hunter.vars\' });'
    );
    await fs.writeFile(registerPath, registerContent, 'utf8');
    console.log('已更新 register.js 文件');

    // 更新 wrangler.toml 中的名稱
    const wranglerPath = 'wrangler.toml';
    let wranglerContent = await fs.readFile(wranglerPath, 'utf8');
    wranglerContent = wranglerContent.replace(
      /name\s*=\s*["'].+["']/,
      'name = "hunterbot"'
    );
    await fs.writeFile(wranglerPath, wranglerContent, 'utf8');
    console.log('已更新 wrangler.toml 文件');

    // 執行註冊和發布命令
    console.log('執行 reg 和 publish 命令...');
    await execPromise('pnpm run reg && pnpm run publish');
    console.log('完成！');
    
    // 將環境變數路徑改回 .dev.vars
    registerContent = await fs.readFile(registerPath, 'utf8');
    registerContent = registerContent.replace(
      /dotenv\.config\(\{\s*path:\s*['"].+['"]\s*\}\);/,
      'dotenv.config({ path: \'.dev.vars\' });'
    );
    await fs.writeFile(registerPath, registerContent, 'utf8');
    console.log('已將 register.js 中的環境變數路徑改回 .dev.vars');
  } catch (error) {
    console.error('發生錯誤:', error);
    process.exit(1);
  }
}

updateFiles(); 