export interface Revenues {
  stationId: number;
  stationName: string;
  period: string;        // ví dụ: "2025-11"
  totalRevenue: number;
}
export interface RevenuesPack{
  totalPackageRevenue:number;
  startDate:string;
  endDate:string;
}