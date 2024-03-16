import { Client, GatewayIntentBits } from 'discord.js';
import Bot from './Bot';

const bot = new Bot(
  new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
    ],
  }),
);

export default bot;
