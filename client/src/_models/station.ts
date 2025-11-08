
export type Post = {
    id: number,
    stationId: number;
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

export interface Pricing{
  id:number;
  name:string;
  priceType:string;
  pricePerKwh:number;
  pricePerMinute:number;
  isActive:boolean;
}


