export type Package = {
    id:number;
    name:string;
    description:string;
    vehicleType : number;
    price : number;
    durationDays : number;
}
export type MyPackage ={
    id:number;
    packageName:string;
    description:string;
    startDate:Date;
    endDate:Date;
    isActive:boolean;
    vehicleType:string;
}