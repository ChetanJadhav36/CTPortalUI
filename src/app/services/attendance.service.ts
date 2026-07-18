import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
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
// ATTENDANCE API CALLS

// Get Attendance By CompanyId
getAttendanceByCompanyId(companyId: any): Observable<any> {
  return this.http.get<any>(
    `${this.base}/Attendance/getattendancebycompanyid/${companyId}`,
    { headers: this.httpOptionsWindowsAuth }
  );
}

// Get Attendance By Id
getAttendanceById(id: any): Observable<any> {
  return this.http.get<any>(
    `${this.base}/Attendance/getattendancebyid/${id}`,
    { headers: this.httpOptionsWindowsAuth }
  );
}

// Get Monthly Attendance
getMonthlyAttendance(
  companyId: number,
  year: number,
  month: number
): Observable<any> {
  return this.http.get<any>(
    `${this.base}/Attendance/getmonthlyattendance?companyId=${companyId}&year=${year}&month=${month}`,
    { headers: this.httpOptionsWindowsAuth }
  );
}

// Get Monthly Attendance Summary
getMonthlyAttendanceSummary(
  companyId: number,
  year: number,
  month: number
): Observable<any> {
  return this.http.get<any>(
    `${this.base}/Attendance/getmonthlyattendancesummary?companyId=${companyId}&year=${year}&month=${month}`,
    { headers: this.httpOptionsWindowsAuth }
  );
}

// Save Monthly Attendance
saveMonthlyAttendance(attendance: any): Observable<any> {
  return this.http.post<any>(`${this.base}/Attendance/bulk-save`,attendance,{ headers: this.httpOptionsWindowsAuth });
}

// Update Attendance
updateAttendanceById(id: any,attendance: any): Observable<any> {
  return this.http.put<any>(`${this.base}/Attendance/updateattendance/${id}`,attendance,{ headers: this.httpOptionsWindowsAuth });
}

// Soft Delete Attendance
deleteAttendanceById(id: any): Observable<any> {
  return this.http.delete<any>(`${this.base}/Attendance/soft/${id}`,{ headers: this.httpOptionsWindowsAuth });
}

}
