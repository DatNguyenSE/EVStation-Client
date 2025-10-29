import { Vehicles } from "./vehicle";

export interface Account  {
    id: string;
    username: string;
    email: string;
    token: string;
    emailConfirmed: boolean;
    roles: string[];
}

export interface User  {
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





