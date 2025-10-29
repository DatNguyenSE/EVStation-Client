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
};

export interface VehicleResponse {
  message: string;
  data: Vehicles;
}


