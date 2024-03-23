import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js';
import { calculateDistance } from '../utils/coordinate';
import { vehicleSpecs } from '../data';
import { bookStation, searchAllStations, searchOneStation } from '../utils/api';

const userIntervals = new Map<string, NodeJS.Timeout>();

const handleMultipleStations = async (
  startDate: Date,
  endDate: Date,
  vehicleType: string | null,
) => {
  const stations = await searchAllStations(startDate, endDate, vehicleType);
  let message = `Total number of vehicles: ${stations.length}\n`;

  // coordinates 530 rue St Hubert
  const latitude = 45.512651;
  const longitude = -73.551921;

  stations.forEach((station) => {
    message += `\nVehicle: ${station.recommendedVehicleId}\n`;
    message += `Station: ${station.stationName}\n`;
    message += `Distance: ${calculateDistance({ latitude, longitude }, station.stationLocation)} kms\n`;
  });
  return { message, vehicles: stations };
};

const handleOneStation = async (
  stationId: string,
  startDate: Date,
  endDate: Date,
  vehicleType: string | null,
) => {
  const vehicles = await searchOneStation(
    stationId,
    startDate,
    endDate,
    vehicleType,
  );

  let message = '';

  vehicles.forEach((vehicle) => {
    message += `\nVehicle ${vehicle.vehicleId}:\n`;
    message += `Model: ${vehicle.make} ${vehicle.model}\n`;
    message += `Type: ${vehicleSpecs.vehicleTypes[vehicle.vehicleTypeId]}\n`;
  });
  return { message, vehicles };
};

const requestAndSendMessage = async (
  stationId: string | null,
  startDate: Date,
  endDate: Date,
  vehicleType: string | null,
  interaction: ChatInputCommandInteraction,
) => {
  const { message: body, vehicles } = stationId
    ? await handleOneStation(stationId, startDate, endDate, vehicleType)
    : await handleMultipleStations(startDate, endDate, vehicleType);

  if (!vehicles.length) return;

  const buttons = vehicles.slice(0, 5).map((vehicle) => {
    const vehicleId =
      'vehicleId' in vehicle ? vehicle.vehicleId : vehicle.recommendedVehicleId;

    return new ButtonBuilder()
      .setCustomId(vehicleId.toString())
      .setLabel(`Book ${vehicleId}`)
      .setStyle(ButtonStyle.Primary);
  });
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
      await bookStation(confirmation.customId, startDate, endDate);
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
      await interaction.channel.send(
        `‼️ ${error.response?.data?.message || error.message}`,
      );
  }
};

export default {
  data: new SlashCommandBuilder()
    .setName('station')
    .setDescription('Get all station vehicles in a zone or station.')
    .addStringOption((option) =>
      option
        .setName('start_date')
        .setDescription('The start date of the period.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('end_date')
        .setDescription('The end date of the period.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('station_id')
        .setDescription('The ID of the station.')
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('vehicle_type')
        .setDescription('The type of the vehicle.')
        .addChoices({ name: 'Véhicule familial', value: '1' })
        .addChoices({ name: 'Véhicule utilitaire', value: '2' })
        .addChoices({ name: 'Intermédiaire', value: '3' })
        .addChoices({ name: 'Compact', value: '4' })
        .addChoices({ name: 'Minifourgonnette', value: '5' })
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName('frequency')
        .setDescription('The frequency of the search.')
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

    const startDate = new Date(
      interaction.options.getString('start_date') || new Date(),
    );

    const endDate = new Date(
      interaction.options.getString('end_date') || new Date(),
    );

    const stationId = interaction.options.getString('station_id');
    const vehicleType = interaction.options.getString('vehicle_type');
    const frequency = parseFloat(
      interaction.options.getString('frequency') || '0',
    );

    requestAndSendMessage(
      stationId,
      startDate,
      endDate,
      vehicleType,
      interaction,
    );

    if (frequency !== 0) {
      const interval = setInterval(() => {
        requestAndSendMessage(
          stationId,
          startDate,
          endDate,
          vehicleType,
          interaction,
        );
      }, frequency * 60000);
      userIntervals.set(userId, interval);
      await interaction.reply(`Search started every ${frequency} minutes !`);
    } else await interaction.reply('No frequency set, search done only once.');
  },
};
