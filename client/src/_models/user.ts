export type Account = {
    id: string;
    username: string;
    email: string;
    token: string;
    emailConfirmed: boolean;
}

export type User = {
    id: string
    userName: string;
    email: string;
    age: number;
    fullName: string;
    roles: string[];
}

export type Vehicle = {
  vehicleId: number;
  model: string;
  type: string;
  batteryCapacityKWh: number;
  maxChargingPowerKW: number;
  connectorType: string;
  plate: string;
};

export type Driver = {
    id: string;
    username: string;
    email: string;
    fullName: string;
    age: number;
    vehicles: Vehicle[];
};

    

export type LoginCreds = {
    username: string;
    password: string;
}

export type RegisterCreds = {
    email: string;
    username: string;
    fullname: string;
    age: number;
    password: string;
}
