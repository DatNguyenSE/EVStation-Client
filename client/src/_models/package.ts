export type Package = {
    id:number;
    name:string;
    description:string;
    vehicleType : string;
    price : number;
    durationDays : number;
    isActive : boolean;
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