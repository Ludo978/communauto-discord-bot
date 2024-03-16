import axios from 'axios';
import puppeteer from 'puppeteer';
import {
  FlexVehicleDetails,
  Station,
  StationVehicle,
  StationVehicleDetails,
  Vehicle,
} from '../types';

const URL = 'https://restapifrontoffice.reservauto.net/api/v2';

export const fetchToken = async () => {
  if (!process.env.COMMUNAUTO_PASSWORD || !process.env.COMMUNAUTO_USERNAME)
    throw new Error('Missing credentials');

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://quebec.client.reservauto.net/', {
    waitUntil: 'networkidle0',
  });

  await page.type('input[name="Username"]', process.env.COMMUNAUTO_USERNAME);
  await page.type('input[name="Password"]', process.env.COMMUNAUTO_PASSWORD);
  await page.click('[data-testid="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  const token = await page.evaluate(() =>
    localStorage.getItem(
      'oidc.user:https://securityservice.reservauto.net:CustomerSpaceV2Client',
    ),
  );
  if (!token) throw new Error('Token not found');

  await browser.close();
  return JSON.parse(token).id_token;
};

export const bookFlex = async (vehicleId: string) => {
  const token = await fetchToken();
  return axios.post(
    `${URL}/Rental/FreeFloating`,
    { vehicleId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const bookStation = async (
  vehicleId: string,
  startDate: Date,
  endDate: Date,
) => {
  const token = await fetchToken();
  return axios.post(
    `${URL}/Rental/StationBased`,
    { vehicleId, startDate, endDate },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const searchAllStations = async (
  startDate: Date,
  endDate: Date,
  vehicleType: string | null,
) => {
  let url = `${URL}/StationAvailability?CityId=${process.env.CITY_ID}&StartDate=${startDate.toISOString()}&EndDate=${endDate.toISOString()}&MinLatitude=45.473251&MaxLatitude=45.541618&MinLongitude=-73.654940&MaxLongitude=-73.538985`;
  if (vehicleType) url += `&VehicleTypes=${vehicleType}`;
  const { data } = await axios.get<{ stations: Station[] }>(url);
  const stations = data.stations.filter(
    (station) => station.recommendedVehicleId && station.satisfiesFilters,
  );
  return stations;
};

export const searchOneStation = async (
  stationId: string,
  startDate: Date,
  endDate: Date,
  vehicleType: string | null,
) => {
  let url = `${URL}/Station/${stationId}/VehicleAvailability?StartDate=${startDate.toISOString()}&EndDate=${endDate.toISOString()}`;
  if (vehicleType) url += `&VehicleTypes=${vehicleType}`;
  const { data } = await axios.get<{ vehicles: StationVehicle[] }>(url);
  return data.vehicles.filter((vehicle) => vehicle.satisfiesFilters);
};

export const getFlexVehicleDetails = async (id: string) => {
  const { data } = await axios.get<FlexVehicleDetails>(
    `${URL}/Vehicle/${id}/FreeFloating?branchId=1`,
  );
  return data;
};

export const getStationVehicleDetails = async (id: string) => {
  const { data } = await axios.get<StationVehicleDetails>(
    `${URL}/Vehicle/${id}/StationBased`,
  );
  return data;
};

export const searchFlex = async (
  minCoordinates: { latitude: number; longitude: number },
  maxCoordinates: { latitude: number; longitude: number },
) => {
  const { data } = await axios.get<{
    vehicles: Vehicle[];
    totalNbVehicles: number;
  }>(
    `${URL}/Vehicle/FreeFloatingAvailability?CityId=${process.env.CITY_ID}&MaxLatitude=${maxCoordinates.latitude}&MinLatitude=${minCoordinates.latitude}&MaxLongitude=${maxCoordinates.longitude}&MinLongitude=${minCoordinates.longitude}`,
  );
  return data;
};
