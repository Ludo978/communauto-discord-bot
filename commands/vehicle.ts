import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { getFlexVehicleDetails, getStationVehicleDetails } from '../utils/api';
import { vehicleSpecs } from '../data';
import { FlexVehicleDetails } from '../types';

export default {
  data: new SlashCommandBuilder()
    .setName('vehicle')
    .setDescription('Get vehicle details')
    .addStringOption((option) =>
      option
        .setName('id')
        .setDescription('The ID of the station.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('vehicle_type')
        .setDescription('If the vehicle is a flex or station vehicle.')
        .addChoices({ name: 'flex', value: 'flex' })
        .addChoices({ name: 'station', value: 'stations' })
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const vehicleId = interaction.options.getString('id');
    const vehicleType = interaction.options.getString('vehicle_type');
    if (!vehicleId || !vehicleType) {
      await interaction.reply('Invalid vehicle ID or vehicle type.');
      return;
    }
    try {
      const vehicle =
        vehicleType === 'flex'
          ? await getFlexVehicleDetails(vehicleId)
          : await getStationVehicleDetails(vehicleId);

      let message = `Vehicule ${vehicle.vehicleNb}:`;
      message += `\n${vehicle.make} ${vehicle.model} ${vehicle.colorLocalizedName} ${vehicle.vehiclePropulsionTypeId !== 1 ? vehicleSpecs.vehiclePropulsionTypes[vehicle.vehiclePropulsionTypeId] : ''}`;
      message += `\nType: ${vehicleSpecs.vehicleTypes[vehicle.vehicleTypeId]} avec ${vehicle.nbPlaces} places`;
      message += `\nPlaque d'immatriculation: ${vehicle.vehiclePlate}`;
      message += `\nAccessoires: ${vehicle.vehicleAccessories
        .map((accessory) => vehicleSpecs.accessories[accessory])
        .join(', ')}`;
      if (vehicle.energyLevelPercentage) {
        message += `\nNiveau de batterie: ${vehicle.energyLevelPercentage}%`;
      }
      if (vehicleType === 'flex') {
        const { currentVehicleLocation, lastUsed, relocationPromotionZoneId } =
          vehicle as FlexVehicleDetails;
        message += `\nLocalisation: ${currentVehicleLocation.latitude}, ${currentVehicleLocation.longitude}`;
        message += `\nDernière utilisation: ${new Date(lastUsed).toLocaleString('fr-FR')}`;
        if (relocationPromotionZoneId) {
          message += `\nPromotion de relocalisation !`;
        }
      }

      await interaction.reply(message.slice(0, 2000));
    } catch (error) {
      console.log(error.message);
      await interaction.reply('Vehicle not found.');
    }
  },
};
