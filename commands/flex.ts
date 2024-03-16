import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js';
import { calculateDistance, getZoneFromCoordinates } from '../utils/coordinate';
import { Coordinates } from '../types';
import { vehicleSpecs } from '../data';
import { bookFlex, searchFlex } from '../utils/api';

const userIntervals = new Map<string, NodeJS.Timeout>();

const requestAndSendMessage = async (
  minCoordinates: Coordinates,
  maxCoordinates: Coordinates,
  interaction: ChatInputCommandInteraction,
  userCoordinates: Coordinates,
) => {
  const { totalNbVehicles, vehicles } = await searchFlex(
    minCoordinates,
    maxCoordinates,
  );
  if (!totalNbVehicles) return;

  let body = `Total number of vehicles: ${totalNbVehicles}\n`;

  vehicles.forEach((vehicle) => {
    body += `\nID: ${vehicle.vehicleId}\n`;
    body += `Distance: ${calculateDistance(userCoordinates, vehicle.vehicleLocation)} kms\n`;
    body += `Type: ${vehicleSpecs.vehicleTypes[vehicle.vehicleTypeId]}\n`;
  });

  const buttons = vehicles
    .slice(0, 5)
    .map((vehicle) =>
      new ButtonBuilder()
        .setCustomId(vehicle.vehicleId.toString())
        .setLabel(`Book ${vehicle.vehicleId}`)
        .setStyle(ButtonStyle.Primary),
    );
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);

  const userId = interaction.user.id;

  if (!interaction.channel) return;

  const message = await interaction.channel.send({
    content: body.slice(0, 2000),
    components: [row],
  });

  try {
    const confirmation = await message.awaitMessageComponent({
      filter: (i) => i.user.id === userId,
      time: 60_000,
    });
    if (confirmation.customId) {
      await bookFlex(confirmation.customId);
      await confirmation.update({
        content: `Vehicle ${confirmation.customId} booked! 🚗`,
        components: [],
      });
      if (userIntervals.has(userId)) {
        clearInterval(userIntervals.get(userId));
        userIntervals.delete(userId);
        await interaction.channel.send('Search stopped !');
      }
    }
  } catch (error) {
    if (
      error.message !==
      'Collector received no interactions before ending with reason: time'
    )
      await interaction.channel.send(`‼️ ${error.message}`);
  }
};

export default {
  data: new SlashCommandBuilder()
    .setName('flex')
    .setDescription('Get all flex in a zone.')
    .addStringOption((option) =>
      option
        .setName('latitude')
        .setDescription('The latitude of the zone.')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('longitude')
        .setDescription('The longitude of the zone.')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('radius')
        .setDescription('The radius of the zone in kms.')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('frequency')
        .setDescription('The frequency of the search in minutes.')
        .setRequired(false),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;

    if (userIntervals.has(userId)) {
      clearInterval(userIntervals.get(userId));
      userIntervals.delete(userId);
      await interaction.reply('Search stopped !');
      return;
    }
    const latitude = parseFloat(
      interaction.options.getString('latitude') || '45.512651',
    );
    const longitude = parseFloat(
      interaction.options.getString('longitude') || '-73.551921',
    );
    const radius = parseFloat(interaction.options.getString('radius') || '1');
    const frequency = parseFloat(
      interaction.options.getString('frequency') || '0',
    );
    const { minCoordinates, maxCoordinates } = getZoneFromCoordinates(
      latitude,
      longitude,
      radius,
    );
    const userCoordinates = { latitude, longitude };

    requestAndSendMessage(
      minCoordinates,
      maxCoordinates,
      interaction,
      userCoordinates,
    );

    if (frequency !== 0) {
      const interval = setInterval(
        () =>
          requestAndSendMessage(
            minCoordinates,
            maxCoordinates,
            interaction,
            userCoordinates,
          ),
        frequency * 60 * 1000,
      );
      userIntervals.set(userId, interval);
      await interaction.reply(`Search started every ${frequency} minutes !`);
    } else await interaction.reply('No frequency set, search done only once.');
  },
};
