
export enum SessionStatus {
  Charging = 'Charging',
  Full = 'Full',
  Completed = 'Completed',
  Error = 'Error',
  StoppedDueToInsufficientFunds = 'StoppedDueToInsufficientFunds',
  Idle = 'Idle'
}

export interface ChargingSessionHistory {
  id: number;
  vehiclePlate: string;
  startTime: string; 
  stationName: string;
  chargingPostCode: string;
  status: SessionStatus; 
  totalCost: number;
  energyConsumed: number;
}

export interface ChargingSessionDetailDto {
  id: number;
  vehiclePlate: string;
  startTime: string;
  endTime?: string;
  completedTime?: string;
  stationName: string;
  chargingPostCode: string;
  status: string;
  totalCost: number;
  energyConsumed: number;
  startBatteryPercentage: number;
  endBatteryPercentage?: number;
  chargingCost: number;
  idleFee?: number;
  overstayFee?: number;
  stopReason?: string;
  isWalkInSession: boolean;
  isPaid: boolean;
  reservationId?: number;
  receiptId?: number;
}
