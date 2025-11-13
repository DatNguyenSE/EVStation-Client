import { Post } from "./station";

export interface Reports {
  id: number;
  description: string;
  status: string;
  severity: string;
  createAt: string;
  maintenanceStartTime?: string | null;
  maintenanceEndTime?: string | null;
  fixedAt?: string | null;
  fixedNote?: string | null;

  createImageUrl?: string | null;
  completedImageUrl?: string | null;

  postId:number;
  technicianName:string;
  post:Post;
  staff: Staff;
  technician?: Technician | null;
}

export interface Staff {
  id: string;
  fullName: string;
  email: string;
}

export interface Technician {
  id: string;
  fullName: string;
  email: string;
}

export interface EvaluateReportRequest {
  isCritical: boolean;
  maintenanceStartTime: string;
  maintenanceEndTime: string;
}
export interface EvaluateResponse {
  message: string;
}

export interface AssignResponse {
  message : string;
}

export interface Task {
  id:number;
  description: string;
  status: string;
  severity: string;
  createAt: string;
  maintenanceStartTime:string;
  maintenanceEndTime:string;
  postId:number;
  postCode:string;
  technicianName:string;
}

export interface Repair{
  message : string;
}
