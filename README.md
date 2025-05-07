## 黑王通報功能

此機器人提供了一個 `/bossreport` 命令，用於通報遊戲中黑王的出現位置。

### 設置步驟

1. 在Discord伺服器中創建一個webhook：
   - 前往您想接收黑王通報的頻道
   - 在頻道設置中選擇"整合">"Webhooks">"新增Webhook"
   - 為webhook命名並複製webhook URL

2. 將 `example.dev.vars` 改名為 `.dev.vars` 並將其中的 `BOSS_WEBHOOK_URL` 更改為您剛才複製的webhook URL。


3. 確保您在 `.dev.vars` 和雲端環境中設置了以下環境變數：
   - `DISCORD_APPLICATION_ID`: 您的 Discord 應用程序 ID
   - `DISCORD_PUBLIC_KEY`: 您的 Discord 應用程序公鑰

4. 運行 `node src/register.js` 以註冊命令。

### 使用方法

用戶可以使用以下格式使用命令：

```
/bossreport map:地圖名稱 channel:頻道號碼
```

機器人將以以下格式將通報發送到指定的webhook頻道：

```
YYYY-MM-DD HH:MM 地圖名稱 - 頻道號碼ch 出現黑王
```

同時，機器人會向使用者發送一條僅自己可見的確認訊息。

## Questions?

Feel free to post an issue here, or reach out to Discord PM:`aa1215`
