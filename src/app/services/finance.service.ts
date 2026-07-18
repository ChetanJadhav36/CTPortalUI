import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private base = environment.apiUrl;

  httpOptions: HttpHeaders = new HttpHeaders({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    charset: 'UTF-8'
  });

  constructor(private http: HttpClient) { }

  // #region Receipts API  
  getReceiptsByCompanyId(companyId: number): Observable<any> {
    return this.http.get<any>(`${this.base}/Receipts/getreceiptsbycompanyid/${companyId}`, { headers: this.httpOptions });
  }
  // Get single receipt by ID
  getReceiptById(id: number, companyId: number): Observable<any> {
    return this.http.get<any>(`${this.base}/Receipts/getreceiptbyid/${id}?companyId=${companyId}`,{ headers: this.httpOptions });
  }
  // Create new receipt
  createReceipt(receipt: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Receipts/createreceipt`, receipt, { headers: this.httpOptions });
  }
  // Update existing receipt
  updateReceipt(id: number, receipt: any): Observable<any> {
    return this.http.put<any>(`${this.base}/Receipts/updatereceipt/${id}`, receipt, { headers: this.httpOptions });
  }
  // Delete receipt
  deleteReceipt(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/Receipts/deletereceipt/${id}`, { headers: this.httpOptions });
  }
  // Search receipts (by voucher number, employee, vehicle, etc.)
  searchReceipts(term: string, companyId: number): Observable<any> {
    const body = { companyId: companyId, term: term };
    return this.http.post<any>(`${this.base}/Receipts/searchreceipts`, body, { headers: this.httpOptions });
  }  
  // #endregion
  
  // #region Expenses API
  // Get all voucher transactions by company ID
  getVoucherTransactionsByCompanyId(transactionData: any): Observable<any> {    
    return this.http.post<any>(`${this.base}/VoucherTransactions/getvouchertransactionsbycompanyid`,transactionData,{ headers: this.httpOptions });
  }
  // Get single voucher transaction by ID
  getVoucherTransactionById(transactionData: any): Observable<any> {
    return this.http.post<any>(`${this.base}/VoucherTransactions/getvouchertransactionbyid`,transactionData,{ headers: this.httpOptions });
  }
  // Create new voucher transaction
  createVoucherTransaction(transactionData: any): Observable<any> {
    return this.http.post<any>(`${this.base}/VoucherTransactions/createvouchertransaction`,transactionData,{ headers: this.httpOptions });
  }
  // Update existing voucher transaction
  updateVoucherTransaction(id: any, transactionData: any): Observable<any> {
    return this.http.put<any>(`${this.base}/VoucherTransactions/updatevouchertransaction/${id}`,transactionData,{ headers: this.httpOptions });
  }
  // Soft delete voucher transaction
  softDeleteVoucherTransaction(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/VoucherTransactions/soft/${id}`,{ headers: this.httpOptions });
  }  
  // Get all transactions by company
  getTransactionsByCompanyId(companyId: number): Observable<any> {
    return this.http.get<any>(`${this.base}/VoucherTransactions/approval/drafts?companyId=${companyId}`,{ headers: this.httpOptions });
  }
  // #endregion
  
  // #region Approval Transactions APIs
  // Approve voucher transaction
  approveVoucherTransaction(transactionData: any): Observable<any> {
    return this.http.post<any>(`${this.base}/VoucherTransactions/approvevouchertransaction`, transactionData, { headers: this.httpOptions });
  }

  // Pay voucher transaction
  payVoucherTransaction(transactionData: any): Observable<any> {
    return this.http.post<any>(`${this.base}/VoucherTransactions/payvouchertransaction`, transactionData, { headers: this.httpOptions });
  }
  // #endregion  
  
  // #region Generate Salary
  // Generate Salary
  generateTempSalaryForMonth(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Salary/generate-temp-salary-for-month`, payload, { headers: this.httpOptions });
  }  
  // Get all generated months by company
  generatedMonths(companyId: number): Observable<any> {
    return this.http.get<any>(`${this.base}/Salary/generated-months/${companyId}`,{ headers: this.httpOptions });
  }
   // Get Salary Report
  getSalaryReport(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Salary/salary-report`, payload, { headers: this.httpOptions });
  }
  // Approve employee salary
  approveSalary(employeeData: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Salary/approveSalary`, employeeData, { headers: this.httpOptions });
  }

  // Get Confirmed Salaries by Company ID
  getConfirmedSalariesByCompanyId(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Salary/confirmed-salaries`, payload, { headers: this.httpOptions });
  }
  // Get Employee Salary by ID
  getEmployeeSalaryById(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Salary/get-salary-by-id`, payload, { headers: this.httpOptions });
  }
  // Pay Employee Salary
  payEmployeeSalary(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Salary/markPaidSalary`, payload, { headers: this.httpOptions });
  }
  // Temp Salary Generation  
  getTempEmployeeSalaryByMonth(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Salary/get-temp-salary-by-month`, payload, { headers: this.httpOptions });
  }  
  deleteTempSalary(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Salary/delete-temp-salary`, payload, { headers: this.httpOptions });
  }
  confirmSalary(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Salary/confirm-temp-salary`, payload, { headers: this.httpOptions });
  }
  getPendingTempSalary(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Salary/check-pending-temp-salary`, payload, { headers: this.httpOptions });
  }
  approveSelectedEmployeesSalary(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Salary/approve-temp-selected-salary`, payload, { headers: this.httpOptions });
  }

  // #endregion
  
  // #region Notes Denominations
    // Get notes denominations
    GetNotesDenominations(companyId: number): Observable<any> {
      return this.http.get<any>(`${this.base}/VoucherTransactions/getnotesdenominations?companyId=${companyId}`, { headers: this.httpOptions });
    }
  // #endregion

  //#region Employee Advance 

  // Get all employee advances by company ID
  getEmployeeAdvancesByCompanyId(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/EmployeeAdvance/getemployeeadvancesbycompanyid`,data,{ headers: this.httpOptions });
  }
  // Get single employee advance by ID
  getEmployeeAdvanceById(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/EmployeeAdvance/getemployeeadvancebyid`,data,{ headers: this.httpOptions });
  }
  // Create new employee advance
  createEmployeeAdvance(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/EmployeeAdvance/createemployeeadvance`,data,{ headers: this.httpOptions });
  }

  // Update employee advance
  updateEmployeeAdvance(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/EmployeeAdvance/updateemployeeadvance/${id}`,data,{ headers: this.httpOptions });
  }

  // Approve employee advance
  approveEmployeeAdvance(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/EmployeeAdvance/approveemployeeadvance`,data,{ headers: this.httpOptions });
  }

  // Pay employee advance
  payEmployeeAdvance(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/EmployeeAdvance/payemployeeadvance`,data,{ headers: this.httpOptions });
  }

  // Soft delete employee advance
  softDeleteEmployeeAdvance(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/EmployeeAdvance/soft/${id}`,{ headers: this.httpOptions });
  }
  //#endregion
  
  //#region Journal Voucher

  // Get all Journal Vouchers by company ID
  getJournalVouchersByCompanyId(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/JV/getjvsbycompanyid`,data,{ headers: this.httpOptions });
  }

  // Get single Journal Voucher by ID
  getJournalVoucherById(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/JV/getjvbyid`,data,{ headers: this.httpOptions });
  }

  // Create Journal Voucher
  createJournalVoucher(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/JV/createjv`,data,{ headers: this.httpOptions });
  }

  // Update Journal Voucher
  updateJournalVoucher(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/JV/updatejv/${id}`,data,{ headers: this.httpOptions });
  }

  // Delete Journal Voucher
  deleteJournalVoucher(id: number): Observable<any> {
    return this.http.delete<any>(`${this.base}/JV/deletejv/${id}`,{ headers: this.httpOptions });
  }
  searchJVEmployee(term: string, companyId: number): Observable<any> {
            const body = { companyId: companyId, term: term };
        return this.http.post<any>(`${this.base}/JV/searchjvemployees`, body, { headers: this.httpOptions } );
  }
//#endregion

  //#region Ledger Report 
  getLedgerReport(data: any): Observable<any> {
      return this.http.post<any>(`${this.base}/Ledger/ledgerreport`,data,{ headers: this.httpOptions });
  }
  //#endregion
  
  //#region Voucher Report
  getVoucherReport(data: any): Observable<any> {
    return this.http.post<any>(`${this.base}/reports/voucher/getvoucherreport`,data,{ headers: this.httpOptions });
  }
  //#endregion
  //#region Voucher Transaction, Employe Advance and Salary Dashbboard Summary
  getVoucherTransactionsDashboardSummary(companyId: any): Observable<any> {
    return this.http.get<any>(`${this.base}/VoucherTransactions/voucher-tran-dashboard-summary?companyId=${companyId}`,{ headers: this.httpOptions });
  }
  getEmployeeAdvancesDashboardSummary(companyId: any): Observable<any> {
    return this.http.get<any>(`${this.base}/EmployeeAdvance/employee-adv-dashboard-summary?companyId=${companyId}`,{ headers: this.httpOptions });
  }    
  getSalaryDashboardSummary(companyId: any): Observable<any> {
    return this.http.get<any>(`${this.base}/Salary/salary-dashboard-summary?companyId=${companyId}`,{ headers: this.httpOptions });
  } 

  //#endregion
}
