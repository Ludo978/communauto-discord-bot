import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { bookFlex, bookStation } from '../utils/api';

export default {
  data: new SlashCommandBuilder()
    .setName('book')
    .setDescription('Book a vehicle.')
    .addStringOption((option) =>
      option.setName('id').setDescription('The vehicle id.').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Station or Flex.')
        .addChoices({ name: 'Station', value: 'station' })
        .addChoices({ name: 'Flex', value: 'flex' })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('start_date')
        .setDescription('The start date of the period (only for station).')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('end_date')
        .setDescription('The end date of the period (only for station).')
        .setRequired(false),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const rawStartDate = interaction.options.getString('start_date');
    const rawEndDate = interaction.options.getString('end_date');
    const type = interaction.options.getString('type');
    const id = interaction.options.getString('id');
    if (!id) {
      interaction.reply({
        content: 'Please provide a vehicle id.',
        ephemeral: true,
      });
      return;
    }
    if (type === 'station' && (!rawStartDate || !rawEndDate)) {
      interaction.reply({
        content: 'Please provide a start and end date.',
        ephemeral: true,
      });
      return;
    }
    const startDate = new Date(rawStartDate || new Date());
    const offset = startDate.getTimezoneOffset();
    startDate.setMinutes(startDate.getMinutes() + offset);

    const endDate = new Date(rawEndDate || new Date());
    endDate.setMinutes(endDate.getMinutes() + offset);

    try {
      if (type === 'flex') await bookFlex(id);
      else await bookStation(id, startDate, endDate);
      interaction.reply('Vehicle booked! 🚗');
    } catch (error) {
      await interaction.reply({
        content: `An error occurred while booking the vehicle:${error.message}`,
        ephemeral: true,
      });
    }
  },
};
