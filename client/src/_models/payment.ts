export type Payments = {
   orderType:string;
   amount:number;
   orderDescription:string;
   name : string;
   txnRef:string;
}

export interface TransactionDto {
  transactionType: string;
  balanceBefore: number;
  balanceAfter: number;
  amount: number;
  description: string;
  createdAt: Date;
  status: string;
}

export interface ManualTopUpDto {
  driverUserName: string;
  amount: number;
}