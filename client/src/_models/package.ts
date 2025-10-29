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