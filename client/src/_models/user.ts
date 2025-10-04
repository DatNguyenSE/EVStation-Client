export type Account = {
    id: string;
    username: string;
    email: string;
    token: string;
}

export type User = {
    id: string
    userName: string;
    email: string;
    age: number;
    fullName: string;
    roles: string[];
}

export type LoginCreds = {
    email: string;
    password: string;
}

export type RegisterCreds = {
    email: string;
    username: string;
    fullname: string;
    age: number;
    password: string;
}