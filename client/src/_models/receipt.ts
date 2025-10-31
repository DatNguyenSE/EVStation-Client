// src/app/receipt/receipt.models.ts

/**
 * Định nghĩa trạng thái hóa đơn (phỏng đoán từ C# enum)
 * Cập nhật các giá trị này ('Pending', 'Paid'...) 
 * cho khớp với C# Enum (ví dụ: 0, 1, 2 hoặc 'Pending', 'Paid')
 */
export type ReceiptStatus = 'Pending' | 'Paid' | 'Cancelled' | 'Refunded';

// === CÁC DTO CHO REQUEST BODY ===

/**
 * Tương ứng với C# CancelRequestDto
 */
export interface CancelRequestDto {
  Reason: string;
}

/**
 * Tương ứng với C# ConfirmPaymentRequestDto
 */
export interface ConfirmPaymentRequestDto {
  PaymentMethod: string;
}

/**
 * Tương ứng với C# RefundRequestDto
 */
export interface RefundRequestDto {
  ReceiptId: number;
  Amount: number;
  Reason: string;
}

// === CÁC DTO CHO RESPONSE DATA ===

/**
 * Tương ứng với C# ReceiptDto
 * (Dùng cho danh sách hóa đơn của USER)
 */
export interface ReceiptDto {
  Id: number;
  SessionIds?: number[];
  CreateAt: string; // DateTime -> string
  Status: ReceiptStatus;
  DriverId?: string;
  DriverName?: string;
  DriverEmail?: string;
  PackageId?: number;
  PackageName?: string;
  EnergyConsumed: number;
  EnergyCost: number;
  IdleFee: number;
  OverstayFee: number;
  DiscountAmount: number;
  TotalCost: number;
  IdleStartTime?: string; // DateTime? -> string?
  IdleEndTime?: string; // DateTime? -> string?
  PricingName: string;
  PricePerKwhSnapshot: number;
  VehiclePlate?: string;
  StationName?: string;
  PostCode?: string;
}

/**
 * Tương ứng với C# ReceiptDetailsDto
 * (Dùng cho trang chi tiết hóa đơn)
 */
export interface ReceiptDetailsDto {
  Id: number;
  CreateAt: string; // DateTime -> string
  Status: ReceiptStatus;
  AppUserId?: string;
  AppUserName?: string;
  PackageId?: number;
  PackageName?: string;
  EnergyConsumed: number;
  EnergyCost: number;
  IdleStartTime?: string; // DateTime? -> string?
  IdleEndTime?: string; // DateTime? -> string?
  IdleFee: number;
  OverstayFee: number;
  DiscountAmount: number;
  TotalCost: number;
  PricingName: string;
  PricePerKwhSnapshot: number;
  PaymentMethod?: string;
  ConfirmedByStaffId?: string;
  ConfirmedByStaffName?: string;
  ConfirmedAt?: string; // DateTime? -> string?
  
  // Bạn cần định nghĩa các interface này
  ChargingSessions: ChargingSessionSummaryDto[];
  WalletTransactions: WalletTransactionSummaryDto[];
}

/**
 * Tương ứng với C# ReceiptSummaryDto
 * (Dùng cho danh sách hóa đơn của ADMIN/STAFF)
 */
export interface ReceiptSummaryDto {
  Id: number;
  CreateAt: string; // DateTime -> string
  Status: ReceiptStatus;
  AppUserId?: string;
  AppUserName?: string;
  TotalCost: number;
  PricingName: string;
  PaymentMethod?: string;
  ConfirmedAt?: string; // DateTime? -> string?
  ConfirmedByStaffName?: string;
}

// === CÁC DTO PHỤ (CHƯA ĐƯỢC ĐỊNH NGHĨA) ===

/**
 * Placeholder cho C# ChargingSessionSummaryDto
 * (Bạn cần cập nhật các trường chính xác)
 */
export interface ChargingSessionSummaryDto {
  Id: number;
  StartTime: string;
  EndTime: string;
  EnergyUsed: number;
  ChargingPostCode: string;
}

/**
 * Placeholder cho C# WalletTransactionSummaryDto
 * (Bạn cần cập nhật các trường chính xác)
 */
export interface WalletTransactionSummaryDto {
  Id: number;
  TransactionDate: string;
  Amount: number;
  Type: string; // 'Deposit', 'Withdrawal', 'Payment'
  Description: string;
}


// === CÁC PARAMS CHO QUERY ===

/**
 * Tương ứng với C# ReceiptFilterParams
 */
export interface ReceiptFilterParams {
  Status?: ReceiptStatus;
  StartDate?: string; // DateTime? -> string?
  EndDate?: string; // DateTime? -> string?
  IsWalkInOnly?: boolean;
  StationId?: number;
  SearchTerm?: string;
}

/**
 * Tương ứng với C# PagingParams
 */
export interface PagingParams {
  PageNumber: number;
  PageSize: number;
}

// === CẤU TRÚC KẾT QUẢ CHUNG ===

/**
 * Cấu trúc trả về chung cho dữ liệu phân trang
 * (Giả định dựa trên logic API)
 */
export interface PaginatedResult<T> {
  Items: T[];
  PageNumber: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
}