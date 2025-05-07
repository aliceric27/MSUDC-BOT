# Cloudflare worker example app

awwbot is an example app that brings the cuteness of `r/aww` straight to your Discord server, hosted on Cloudflare workers. Cloudflare Workers are a convenient way to host Discord bots due to the free tier, simple development model, and automatically managed environment (no VMs!).

The tutorial for building awwbot is [in the developer documentation](https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers)

![awwbot in action](https://user-images.githubusercontent.com/534619/157503404-a6c79d1b-f0d0-40c2-93cb-164f9df7c138.gif)

## Resources used

- [Discord Interactions API](https://discord.com/developers/docs/interactions/receiving-and-responding)
- [Cloudflare Workers](https://workers.cloudflare.com/) for hosting
- [Reddit API](https://www.reddit.com/dev/api/) to send messages back to the user

---

## Project structure

Below is a basic overview of the project structure:

```
├── .github/workflows/ci.yaml -> Github Action configuration
├── src
│   ├── commands.js           -> JSON payloads for commands
│   ├── reddit.js             -> Interactions with the Reddit API
│   ├── register.js           -> Sets up commands with the Discord API
│   ├── server.js             -> Discord app logic and routing
├── test
|   ├── test.js               -> Tests for app
├── wrangler.toml             -> Configuration for Cloudflare workers
├── package.json
├── README.md
├── .eslintrc.json
├── .prettierignore
├── .prettierrc.json
└── .gitignore
```

## Configuring project

Before starting, you'll need a [Discord app](https://discord.com/developers/applications) with the following permissions:

- `bot` with the `Send Messages` and `Use Slash Command` permissions
- `applications.commands` scope

> ⚙️ Permissions can be configured by clicking on the `OAuth2` tab and using the `URL Generator`. After a URL is generated, you can install the app by pasting that URL into your browser and following the installation flow.

## Creating your Cloudflare worker

Next, you'll need to create a Cloudflare Worker.

- Visit the [Cloudflare dashboard](https://dash.cloudflare.com/)
- Click on the `Workers` tab, and create a new service using the same name as your Discord bot

## Running locally

First clone the project:

```
git clone https://github.com/discord/cloudflare-sample-app.git
```

Then navigate to its directory and install dependencies:

```
cd cloudflare-sample-app
npm install
```

> ⚙️ The dependencies in this project require at least v18 of [Node.js](https://nodejs.org/en/)

### Local configuration

> 💡 More information about generating and fetching credentials can be found [in the tutorial](https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers#storing-secrets)

Rename `example.dev.vars` to `.dev.vars`, and make sure to set each variable.

**`.dev.vars` contains sensitive data so make sure it does not get checked into git**.

### Register commands

The following command only needs to be run once:

```
$ npm run register
```

### Run app

Now you should be ready to start your server:

```
$ npm start
```

### Setting up ngrok

When a user types a slash command, Discord will send an HTTP request to a given endpoint. During local development this can be a little challenging, so we're going to use a tool called `ngrok` to create an HTTP tunnel.

```
$ npm run ngrok
```

![forwarding](https://user-images.githubusercontent.com/534619/157511497-19c8cef7-c349-40ec-a9d3-4bc0147909b0.png)

This is going to bounce requests off of an external endpoint, and forward them to your machine. Copy the HTTPS link provided by the tool. It should look something like `https://8098-24-22-245-250.ngrok.io`. Now head back to the Discord Developer Dashboard, and update the "Interactions Endpoint URL" for your bot:

![interactions-endpoint](https://user-images.githubusercontent.com/534619/157510959-6cf0327a-052a-432c-855b-c662824f15ce.png)

This is the process we'll use for local testing and development. When you've published your bot to Cloudflare, you will _want to update this field to use your Cloudflare Worker URL._

## Deploying app

This repository is set up to automatically deploy to Cloudflare Workers when new changes land on the `main` branch. To deploy manually, run `npm run publish`, which uses the `wrangler publish` command under the hood. Publishing via a GitHub Action requires obtaining an [API Token and your Account ID from Cloudflare](https://developers.cloudflare.com/workers/wrangler/cli-wrangler/authentication/#generate-tokens). These are stored [as secrets in the GitHub repository](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository), making them available to GitHub Actions. The following configuration in `.github/workflows/ci.yaml` demonstrates how to tie it all together:

```yaml
release:
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  needs: [test, lint]
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
    - run: npm install
    - run: npm run publish
      env:
        CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
        CF_ACCOUNT_ID: ${{ secrets.CF_ACCOUNT_ID }}
```

### Storing secrets

The credentials in `.dev.vars` are only applied locally. The production service needs access to credentials from your app:

```
$ wrangler secret put DISCORD_TOKEN
$ wrangler secret put DISCORD_PUBLIC_KEY
$ wrangler secret put DISCORD_APPLICATION_ID
```

## 黑王通報功能

此機器人提供了一個 `/bossreport` 命令，用於通報遊戲中黑王的出現位置。

### 設置步驟

1. 在Discord伺服器中創建一個webhook：
   - 前往您想接收黑王通報的頻道
   - 在頻道設置中選擇"整合">"Webhooks">"新增Webhook"
   - 為webhook命名並複製webhook URL

2. 將 `src/commands.js` 中的 `BOSS_WEBHOOK_URL` 更改為您剛才複製的webhook URL。

   ```js
   export const BOSS_WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE'; // 替換為實際的webhook URL
   ```

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

Feel free to post an issue here, or reach out to [@justinbeckwith](https://twitter.com/JustinBeckwith)!
