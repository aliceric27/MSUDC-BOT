/**
 * The core server that runs on a Cloudflare worker.
 */

import { AutoRouter } from 'itty-router';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { 
  BOSS1_COMMAND,
  BOSS2_COMMAND,
  BOSS3_COMMAND,
  GMS_SEARCH_COMMAND, 
} from './commands.js';
// import { getCuteUrl } from './reddit.js';
import { InteractionResponseFlags } from 'discord-interactions';
import {
  JsonResponse,
  handleBossServerCommand,
  handleGmsSearchCommand,
} from './commands/index.js';

// 使用KV存儲或內存存儲來記錄訊息與用戶的對應關係
const messageRegistry = new Map(); // messageId -> messageInfo
const userMessages = new Map();   // userId -> Set of messageIds

const router = AutoRouter();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env,
  );
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.PING) {
    // The `PING` message is used during the initial webhook handshake, and is
    // required to configure the webhook in the developer portal.
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    // Most user commands will come as `APPLICATION_COMMAND`.
    switch (interaction.data.name.toLowerCase()) {
      case BOSS1_COMMAND.name.toLowerCase(): {
        return handleBossServerCommand(interaction, env, messageRegistry, userMessages, 1);
      }
      case BOSS2_COMMAND.name.toLowerCase(): {
        return handleBossServerCommand(interaction, env, messageRegistry, userMessages, 2);
      }
      case BOSS3_COMMAND.name.toLowerCase(): {
        return handleBossServerCommand(interaction, env, messageRegistry, userMessages, 3);
      }
      case GMS_SEARCH_COMMAND.name.toLowerCase(): {
        return handleGmsSearchCommand(interaction, env, messageRegistry, userMessages);
      }
      default:
        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
    }
  }

  console.error('Unknown Type');
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest(request, env) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
  if (!isValidRequest) {
    return { isValid: false };
  }

  return { interaction: JSON.parse(body), isValid: true };
}

const server = {
  verifyDiscordRequest,
  fetch: router.fetch,
};

export default server;
