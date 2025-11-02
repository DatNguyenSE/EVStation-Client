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
  reason: string;
}

/**
 * Tương ứng với C# ConfirmPaymentRequestDto
 */
export interface ConfirmPaymentRequestDto {
  paymentMethod: string;
}

/**
 * Tương ứng với C# RefundRequestDto
 */
export interface RefundRequestDto {
  receiptId: number;
  amount: number;
  reason: string;
}

// === CÁC DTO CHO RESPONSE DATA ===

/**
 * Tương ứng với C# ReceiptDto
 * (Dùng cho danh sách hóa đơn của USER)
 */
export interface ReceiptDto {
  id: number;
  sessionIds?: number[];
  createAt: string; // DateTime -> string
  status: ReceiptStatus;
  driverId?: string;
  driverName?: string;
  driverEmail?: string;
  packageId?: number;
  packageName?: string;
  energyConsumed: number;
  energyCost: number;
  idleFee: number;
  overstayFee: number;
  discountAmount: number;
  totalCost: number;
  idleStartTime?: string; // DateTime? -> string?
  idleEndTime?: string; // DateTime? -> string?
  pricingName: string;
  pricePerKwhSnapshot: number;
  vehiclePlate?: string;
  stationName?: string;
  postCode?: string;
}

/**
 * Tương ứng với C# ReceiptDetailsDto
 * (Dùng cho trang chi tiết hóa đơn)
 */
export interface ReceiptDetailsDto {
  id: number;
  createAt: string; // DateTime -> string
  status: ReceiptStatus;
  appUserId?: string;
  appUserName?: string;
  packageId?: number;
  packageName?: string;
  energyConsumed: number;
  energyCost: number;
  idleStartTime?: string; // DateTime? -> string?
  idleEndTime?: string; // DateTime? -> string?
  idleFee: number;
  overstayFee: number;
  discountAmount: number;
  totalCost: number;
  pricingName: string;
  pricePerKwhSnapshot: number;
  paymentMethod?: string;
  confirmedByStaffId?: string;
  confirmedByStaffName?: string;
  confirmedAt?: string; // DateTime? -> string?
  
  chargingSessions: ChargingSessionSummaryDto[];
  walletTransactions: WalletTransactionSummaryDto[];
}

/**
 * Tương ứng với C# ReceiptSummaryDto
 * (Dùng cho danh sách hóa đơn của ADMIN/STAFF)
 */
export interface ReceiptSummaryDto {
  id: number;
  createAt: string; // DateTime -> string
  status: ReceiptStatus;
  appUserId?: string;
  appUserName?: string;
  totalCost: number;
  pricingName: string;
  paymentMethod?: string;
  confirmedAt?: string; // DateTime? -> string?
  confirmedByStaffName?: string;
}

// === CÁC DTO PHỤ (CHƯA ĐƯỢC ĐỊNH NGHĨA) ===

/**
 * Placeholder cho C# ChargingSessionSummaryDto
 * (Bạn cần cập nhật các trường chính xác)
 */
export interface ChargingSessionSummaryDto {
  id: number;
  startTime: string;
  endTime: string;
  energyUsed: number;
  chargingPostCode: string;
}

/**
 * Placeholder cho C# WalletTransactionSummaryDto
 * (Bạn cần cập nhật các trường chính xác)
 */
export interface WalletTransactionSummaryDto {
  id: number;
  transactionDate: string;
  amount: number;
  type: string; // 'Deposit', 'Withdrawal', 'Payment'
  description: string;
}


// === CÁC PARAMS CHO QUERY ===

/**
 * Tương ứng với C# ReceiptFilterParams
 */
export interface ReceiptFilterParams {
  status?: ReceiptStatus;
  startDate?: string; // DateTime? -> string?
  endDate?: string; // DateTime? -> string?
  isWalkInOnly?: boolean;
  appUserName?: string;
}

/**
 * Tương ứng với C# PagingParams
 */
export interface PagingParams {
  pageNumber: number;
  pageSize: number;
}

// === CẤU TRÚC KẾT QUẢ CHUNG ===

/**
 * Cấu trúc trả về chung cho dữ liệu phân trang
 * (Giả định dựa trên logic API)
 */
export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalItemCount: number;
  pageCount: number;
}