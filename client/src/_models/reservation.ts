export interface ReservationRequest {
  vehicleId: number;
  chargingPostId: number;
  timeSlotStart: string;
  slotCount: number;
}

export interface ReservationResponse {
  id?: number;
  message?: string;
  success?: boolean;
  createdAt?: string;
}