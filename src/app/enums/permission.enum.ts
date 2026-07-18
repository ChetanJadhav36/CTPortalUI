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

// New Enums for Payment Modes
export enum VoucherType {
    REC = 1,
    EXP = 2,    
    DEP = 3,
    ADV = 4,
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
