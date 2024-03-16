import { Coordinates } from '../types';

const earthRadius = 6371;

const radToDeg = (rad: number) => rad * (180 / Math.PI);
const degTorad = (deg: number) => deg * (Math.PI / 180);

const addKilometersToCoordinates = (
  latitude: number,
  longitude: number,
  kms: number,
): Coordinates => {
  const dLat = kms / earthRadius;
  const dLon = kms / (earthRadius * Math.cos(degTorad(latitude)));

  return {
    latitude: latitude + radToDeg(dLat),
    longitude: longitude + radToDeg(dLon),
  };
};

export const getZoneFromCoordinates = (
  latitude: number,
  longitude: number,
  kms: number,
) => {
  const minCoordinates = addKilometersToCoordinates(latitude, longitude, -kms);
  const maxCoordinates = addKilometersToCoordinates(latitude, longitude, kms);

  return { minCoordinates, maxCoordinates };
};

export const calculateDistance = (point1: Coordinates, point2: Coordinates) => {
  const dLat = degTorad(point2.latitude - point1.latitude);
  const dLon = degTorad(point2.longitude - point1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degTorad(point1.latitude)) *
      Math.cos(degTorad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c; // Distance in km
  return distance.toFixed(2);
};
