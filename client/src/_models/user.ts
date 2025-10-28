export type Account = {
    id: string;
    username: string;
    email: string;
    token: string;
    emailConfirmed: boolean;
    roles: string[];
}

export type User = {
    id: string
    userName: string;
    email: string;
    dateOfBirth: string;
    fullName: string;
    roles: string[];
}

export type Driver = {
    id: string;
    username: string;
    email: string;
    fullName: string;
    dateOfBirth: number;
    vehicles: Vehicles[];
}; 

export type LoginCreds = {
    username: string;
    password: string;
}

export type RegisterCreds = {
    email: string;
    username: string;
    fullname: string;
    dateOfBirth: string;
    password: string;
}
export type Package = {
    id:number;
    name:string;
    description:string;
    vehicleType : number;
    price : number;
    durationDays : number;
}
export type MyPackage ={
    packageName:string;
    description:string;
    startDate:Date;
    endDate:Date;
    isActive:boolean;
    vehicleType:string;
}

export type Payments = {
   orderType:string;
   amount:number;
   orderDescription:string;
   name : string;
   txnRef:string;
}

export interface VehicleModelDetail {
  model: string;
  type: string;
  batteryCapacityKWh: number;
  maxChargingPowerKW: number;
  connectorType: string;
  hasDualBattery: boolean;
}

export type Vehicles = {
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
export interface TransactionDto {
  transactionType: string;
  balanceBefore: number;
  balanceAfter: number;
  amount: number;
  description: string;
  createdAt: Date;
  status: string;
}



