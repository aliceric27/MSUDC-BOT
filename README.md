
# 黑王通報機器人

此機器人提供了黑王通報功能，可向指定頻道發送遊戲中黑王的出現位置。

## 功能

- `/boss1` - 通報1服黑王BOSS（需提供頻道號碼和圖片）
- `/boss2` - 通報2服黑王BOSS（需提供頻道號碼和圖片）
- `/boss3` - 通報3服黑王BOSS（需提供頻道號碼和圖片）
- `/gmssearch` - 任務、道具查詢(GMS)（需提供關鍵字）

## 安裝

[Discord Cloudflare 應用參考](https://github.com/discord/cloudflare-sample-app)

```
pnpm install
pnpm install wrangler
npx wrangler --version
```

## 設置步驟

1. 在Discord伺服器中創建webhook：
   - 前往需接收黑王通報的頻道
   - 在頻道設置中選擇"整合">"Webhooks">"新增Webhook"
   - 為webhook命名並複製webhook URL

2. 將 `example.dev.vars` 改名為 `.dev.vars` 並設置以下環境變數：
   - `DISCORD_APPLICATION_ID`: Discord應用程序ID
   - `DISCORD_PUBLIC_KEY`: Discord應用程序公鑰
   - `BOSS_WEBHOOK_URL_1`: 1服黑王通報webhook URL
   - `BOSS_WEBHOOK_URL_2`: 2服黑王通報webhook URL
   - `BOSS_WEBHOOK_URL_3`: 3服黑王通報webhook URL
   - `GUILD_ID`: Discord伺服器ID

3. 運行 `pnpm reg` 註冊命令

## 開發與部署

- 本地開發: `pnpm dev`
- Ngrok: `ngrok http 8787`
- 部署: `pnpm publish`

## 使用方法

### 黑王通報

```
/boss1 channel:頻道號碼 image:圖片
/boss2 channel:頻道號碼 image:圖片
/boss3 channel:頻道號碼 image:圖片
```

機器人會發送通報至指定webhook頻道，並顯示圖片。

### GMS查詢

```
/gmssearch keyword:關鍵字
```

## 問題與支援

有任何問題請提交issue或聯繫Discord: `aa1215`
