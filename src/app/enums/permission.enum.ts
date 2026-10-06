export enum Permission {
  Create = 'CREATE',
  Read = 'READ',
  Update = 'UPDATE',
  Delete = 'DELETE',
  ManageUsers = 'MANAGE_USERS'
}
// New Enums for Receipt Types
export enum ReceiptType {
    Cash = 1,
    Bank = 2
}

// New Enums for Payment Modes
export enum PaymentType {
    Cash = 1,
    Bank = 2
}

export enum ReceiptType
{
    REC = 1
}

export enum ExpenseType
{
    EXP = 1
}

export enum BankDepositType
{
    BDEP = 1
}

export enum EmployeeAdvanceType
{
    EADV = 1
}

export enum JVType
{
    JV = 1
}

export enum SalaryType
{
    SAL = 1
}
// Used for Receipt, Expense, Bank Deposit, Employee Advance Table
export enum VoucherType {
    REC = 1,
    EXP = 2,    
    BDEP = 3,
    EADV = 4,
    JV = 5
}

// Used for Voucher Report 
export enum VoucherReportType
{
    REC = 1,    // Receipt 
    EXP = 2,    // Expense
    BDEP = 3,   // Bank Deposit
    EADV = 4,   // Employee Advance
    SAL = 5,    // Salary
    JV = 6      // Journal Voucher
}
export enum TransactionStatus {
    Draft = 1,
    Approved = 2,
    Paid = 3,
    Reversed = 4
}
export enum AttendanceStatus
{
    Present = 1,
    Absent = 2,
    Late = 3,
    HalfDay = 4,
    OnLeave = 5,
    Holiday = 6
}
export enum SalaryStatus
{
    Generated = 1,
    Approved = 2,
    Rejected = 3,
    Paid = 4
}
export enum PermissionAction {
  View = 'CanView',
  Add = 'CanAdd',
  Update = 'CanUpdate'
}
export enum CompanyRole {
  Admin = 1,
  User = 2
}
export enum RelationshipType {
  Father = 1,
  Mother = 2,
  Husband = 3,
  Wife = 4,
  Brother = 5,
  Sister = 6,
  Son = 7,
  Daughter = 8
}

export enum PaymentStatus {
    Pending = 1,
    Partial = 2,
    Paid = 3
}