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

export type eventReservation = {
    id: string,
    vehicleId: string,
    chargingPostId: string,
    driverId: string,
    timeSlotStart: string,
    timeSlotEnd: string,
    status: string,
    createdAt: string
}