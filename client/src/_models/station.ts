
export type Post = {
    id: string,
    stationId: string;
    code: string,
    type: string,
    powerKW: string,
    connectorType: string,
    status: string,
    isWalkIn: boolean,
  };

  export interface DtoStation {
  id: number;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  openTime: string;
  closeTime: string;
  status: string;
  distance:number;
  chargingPosts: Post[];
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
