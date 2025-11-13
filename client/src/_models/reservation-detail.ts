export interface ReservationDetail {
  id: number;
  driverId: string;
  timeSlotStart: string;
  timeSlotEnd: string;
  status: string;

  postId: number;
  postCode: string;
  connectorType: string;
  powerKW: number;

  stationId: number;
  stationName: string;
  stationAddress: string;
}