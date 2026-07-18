import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionService {
  private base = environment.apiUrl;

  httpOptions: HttpHeaders = new HttpHeaders({
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    charset: 'UTF-8'
  });

  constructor(private http: HttpClient) { }
  
  // ================== User Companies API ==================
  // Company Users API Calls
    getUsersCompanyId(id: any){     
        return this.http.get<any>(`${this.base}/UserCompanies/getusersbycompanyid/${id}`, { headers: this.httpOptions });        
    }
  
  // Get all Pages
  getPages(): Observable<any> {
    return this.http.get<any>(`${this.base}/Page/getPages`, { headers: this.httpOptions });
  }  
  // Get Page by ID
  getPageById(id: any): Observable<any> {
    return this.http.get<any>(`${this.base}/Page/getpagebyid/${id}`, { headers: this.httpOptions });
  }
  // Create Page
  createPage(pageData: any): Observable<any> {
    return this.http.post<any>(`${this.base}/Page/createpage`, pageData, { headers: this.httpOptions });
  }
  // Update Page
  updatePageById(id: any, pageData: any): Observable<any> {
    return this.http.put<any>(`${this.base}/Page/updatepage/${id}`, pageData, { headers: this.httpOptions });
  }

  // User Access Control API Calls
  getUserPageAccessById(payload: any): Observable<any> {
        return this.http.post<any>(`${this.base}/UserPageAccess/getuserpageaccessbyid`, payload, { headers: this.httpOptions });
  }
  bulkUpdateUserPageAccess(payload: any): Observable<any> {
    return this.http.put<any>(`${this.base}/UserPageAccess/bulkupdateuserpageaccess`, payload, { headers: this.httpOptions });
  }
  getuserpagesaccess(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/UserPageAccess/getuserpagesaccess`, payload, { headers: this.httpOptions });
  }  
  softdeleteuserpageaccess(id: any): Observable<any> {
        return this.http.delete<any>(`${this.base}/Vehicles/deletevehicle/${id}`,{ headers: this.httpOptions });
  }
  getusercompanybyuserid(payload: any): Observable<any> {
    return this.http.post<any>(`${this.base}/UserCompanies/getusercompanybyuserid`, payload, { headers: this.httpOptions });
  }
}
