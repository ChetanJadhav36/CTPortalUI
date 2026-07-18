import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  private base = environment.apiUrl;  
    constructor(
    private http: HttpClient
  ) {}
  
  httpOptionsWindowsAuth: HttpHeaders =
    new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      charset: 'UTF-8',
    }); 
  // Employees API Calls
  getEmployeesByCompanyId(companyId: any) {     
      return this.http.get<any>(`${this.base}/Employees/getemployeesbycompanyid/${companyId}`, { headers: this.httpOptionsWindowsAuth });
  }

  registerEmployee(employee: any): Observable<any> {     
      return this.http.post<any>(`${this.base}/Employees/createemployee`, employee, { headers: this.httpOptionsWindowsAuth });
  }

  getEmployeeById(id: any): Observable<any> {     
      return this.http.get<any>(`${this.base}/Employees/getemployeebyid/${id}`, { headers: this.httpOptionsWindowsAuth });
  }

  updateEmployeeById(id: any, employee: any): Observable<any> {     
      return this.http.put<any>(`${this.base}/Employees/updateemployee/${id}`, employee, { headers: this.httpOptionsWindowsAuth });
  }
  // Employee Contact API Calls
  GetEmployeeDetailsByEmployeeId(employeeId: number, companyId: number): Observable<any> {
    return this.http.get<any>(
    `${this.base}/EmployeeContacts/getemployeedetailsbyemployeeid/${employeeId}?companyId=${companyId}`);
  }
  getContactById(contactId: number, employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.base}/EmployeeContacts/getemployeecontactbyid/${contactId}?employeeId=${employeeId}`
    );
  }
  createContact(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/EmployeeContacts/createcontact`,payload);
  }
  updateContact(contactId: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.base}/EmployeeContacts/updatecontact/${contactId}`,payload);
  }
  searchEmployees(term: string, companyId: number): Observable<any> {
            const body = { companyId: companyId, term: term };
        return this.http.post<any>(`${this.base}/Employees/searchemployees`, body, { headers: this.httpOptionsWindowsAuth } );
  }
  searchEmployeeAdvancePayment(term: string, companyId: number): Observable<any> {
            const body = { companyId: companyId, term: term };
        return this.http.post<any>(`${this.base}/Employees/searchemployeeadvancepayment`, body, { headers: this.httpOptionsWindowsAuth } );
  }
}
