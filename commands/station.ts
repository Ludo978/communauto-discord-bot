import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { calculateDistance } from '../utils/coordinate';
import { vehicleSpecs } from '../data';
import { searchAllStations, searchOneStation } from '../utils/api';

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

  stations.forEach((station, index) => {
    message += `\nVehicle ${index + 1}:\n`;
    message += `ID: ${station.recommendedVehicleId}\n`;
    message += `Station: ${station.stationName}\n`;
    message += `Distance: ${calculateDistance({ latitude, longitude }, station.stationLocation)} kms\n`;
  });
  return message;
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
    message += `Vehicle ${vehicle.vehicleNb}:\n`;
    message += `Model: ${vehicle.make} ${vehicle.model}\n`;
    message += `Type: ${vehicleSpecs.vehicleTypes[vehicle.vehicleTypeId]}\n`;
  });
  return message;
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
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const startDate = new Date(
      interaction.options.getString('start_date') || new Date(),
    );
    const endDate = new Date(
      interaction.options.getString('end_date') || new Date(),
    );
    const stationId = interaction.options.getString('station_id');
    const vehicleType = interaction.options.getString('vehicle_type');
    const message = stationId
      ? await handleOneStation(stationId, startDate, endDate, vehicleType)
      : await handleMultipleStations(startDate, endDate, vehicleType);

    await interaction.reply(message.slice(0, 2000));
  },
};
