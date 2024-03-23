import {
  ApplicationCommandDataResolvable,
  Client,
  Collection,
  Events,
  Interaction,
  REST,
  Routes,
} from 'discord.js';
import dotenv from 'dotenv';
import { readdirSync } from 'fs';

import { join } from 'path';
import { Command } from './types';

dotenv.config();

export default class Bot {
  public commands = new Collection<string, Command>();

  constructor(public readonly client: Client) {
    this.client.login(process.env.DISCORD_BOT_TOKEN);

    this.client.on('ready', () => {
      console.log(`${this.client.user!.username} ready!`);

      this.registerSlashCommands();
    });

    this.client.on('warn', (info) => console.log(info));
    this.client.on('error', console.error);

    this.handleInteractionCreated();
  }

  private async registerSlashCommands() {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) throw new Error('No token provided');
    const rest = new REST().setToken(token);
    const commandFiles = readdirSync(join(__dirname, 'commands')).filter(
      (file) => !file.endsWith('.map'),
    );

    const commandsData = new Array<ApplicationCommandDataResolvable>();

    const commands = await Promise.all(
      commandFiles.map(
        (file) => import(join(__dirname, 'commands', `${file}`)),
      ),
    );

    commands.forEach((command) => {
      this.commands.set(command.default.data.name, command.default);
      commandsData.push(command.default.data.toJSON());
    });

    const data: any = await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID as string,
        process.env.GUILD_ID as string,
      ),
      {
        body: commandsData,
      },
    );

    console.log(`Successfully loaded ${data.length} application commands.`);
  }

  private async handleInteractionCreated() {
    this.client.on(
      Events.InteractionCreate,
      async (interaction: Interaction): Promise<any> => {
        if (!interaction.isChatInputCommand()) return;

        const command = this.commands.get(interaction.commandName);

        if (!command) {
          console.error(
            `No command matching ${interaction.commandName} was found.`,
          );
          return;
        }

        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(error);
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: 'There was an error while executing this command!',
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: 'There was an error while executing this command!',
              ephemeral: true,
            });
          }
        }
      },
    );
  }
}
