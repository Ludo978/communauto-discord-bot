import { SlashCommandBuilder } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder;
  execute(...args: any): any;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type Vehicle = {
  vehicleId: number;
  vehicleNb: number;
  cityId: number;
  vehiclePropulsionTypeId: VehiclePropulsionTypeEnum;
  vehicleTypeId: VehicleTypeEnum;
  vehicleBodyTypeId: number;
  vehicleTransmissionTypeId: number;
  vehicleTireTypeId: number;
  vehiclePromotions: number[];
  vehicleAccessories: VehicleAccessoriesEnum[];
  vehicleLocation: {
    latitude: number;
    longitude: number;
  };
  satisfiesFilters: boolean;
  energyLevelPercentage: number | null;
};

export type VehicleTypeEnum = 1 | 2 | 3 | 4 | 5;
export type VehicleAccessoriesEnum =
  | 1
  | 2
  | 3
  | 5
  | 6
  | 7
  | 8
  | 9
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 21
  | 22;
export type VehiclePropulsionTypeEnum = 1 | 2 | 3 | 4 | 5;

export type StationVehicle = {
  vehicleId: number;
  vehicleNb: number;
  make: string;
  model: string;
  color: string;
  colorLocalizedName: string;
  vehicleAccessories: VehicleAccessoriesEnum[];
  vehiclePromotions: any[];
  vehicleTypeId: VehicleTypeEnum;
  vehicleBodyTypeId: number;
  vehiclePropulsionTypeId: VehiclePropulsionTypeEnum;
  vehicleTransmissionTypeId: number;
  vehicleTireTypeId: number;
  isRecommendedVehicle: boolean;
  hasRentalNotifications: boolean;
  hasAllRequestedOptions: boolean;
  satisfiesFilters: boolean;
  vehicleTimeAvailabilities: {
    startDate: Date;
    endDate: Date;
    blockDurationInMinutes: number;
  }[];
};

export type Station = {
  stationId: number;
  stationNb: string;
  stationName: string;
  stationLocation: {
    latitude: number;
    longitude: number;
  };
  cityId: number;
  recommendedVehicleId: number;
  hasAllRequestedOptions: boolean;
  satisfiesFilters: boolean;
  hasZone: boolean;
};

export type FlexVehicleDetails = {
  branchId: number;
  cityId: number;
  make: string;
  model: string;
  color: string;
  colorLocalizedName: string;
  nbDoors: number;
  nbPlaces: number;
  note: string;
  vehiclePlate: string;
  vehiclePropulsionTypeId: VehiclePropulsionTypeEnum;
  vehicleTypeId: VehicleTypeEnum;
  vehicleBodyTypeId: number;
  vehicleTransmissionTypeId: number;
  vehicleTireTypeId: number;
  vehicleAccessories: VehicleAccessoriesEnum[];
  energyLevelPercentage: number | null;
  lastUsed: Date;
  currentVehicleLocation: Coordinates;
  relocationPromotionZoneId: number | null;
  hasRentalNotifications: boolean;
  hasOnDemandFuelCreditCard: boolean;
  vehicleId: number;
  vehicleNb: number;
};

export type StationVehicleDetails = {
  branchId: number;
  cityId: number;
  make: string;
  model: string;
  color: string;
  colorLocalizedName: string;
  nbDoors: number;
  nbPlaces: number;
  note: string;
  vehiclePlate: string;
  vehiclePropulsionTypeId: VehiclePropulsionTypeEnum;
  vehicleTypeId: VehicleTypeEnum;
  vehicleTransmissionTypeId: number;
  vehicleTireTypeId: number;
  vehicleBodyTypeId: number;
  vehicleAccessories: VehicleAccessoriesEnum[];
  energyLevelPercentage: number | null;
  hasOnDemandFuelCreditCard: boolean;
  vehicleId: number;
  vehicleNb: number;
};
