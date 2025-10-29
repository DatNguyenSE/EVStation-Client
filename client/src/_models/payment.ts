export type Payments = {
   orderType:string;
   amount:number;
   orderDescription:string;
   name : string;
   txnRef:string;
}
export type Package = {
    id:number;
    name:string;
    description:string;
    vehicleType : number;
    price : number;
    durationsDay : number;
}