export interface VehicleModelDetail {
  model: string;
  type: string;
  batteryCapacityKWh: number;
  maxChargingPowerKW: number;
  connectorType: string;
  hasDualBattery: boolean;
}

export interface Vehicles  {
  vehicleId: number;
  model: string;
  type: string;
  batteryCapacityKWh: number;
  maxChargingPowerKW: number;
  connectorType: string;
  plate: string;
  registrationStatus: string;
  registrationImageUrl: string;
};
export interface VehiclePending {
  vehicleId: number;
  model: string;
  plate: string;
  vehicleType: string;
  ownerName: string;
  ownerEmail: string;
  registrationImageUrl: string;
  registrationStatus: string;
}




export interface VehicleResponse {
  message: string;
  data: Vehicles;
}