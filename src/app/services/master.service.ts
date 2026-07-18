import { Injectable } from '@angular/core';
import { TokenUtility } from './token.utility';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MasterService {
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
    // Companies API Calls
    getCompanies(){     
        return this.http.get<any>(`${this.base}/Companies`, { headers: this.httpOptionsWindowsAuth });
    }
    registerCompany(company: any): Observable<any> {     
        return this.http.post<any>(`${this.base}/Companies/registercompany`, company, { headers: this.httpOptionsWindowsAuth });
    }
    getCompanyById(id: any): Observable<any> {     
        return this.http.get<any>(`${this.base}/Companies/getcompanybyid/${id}`, { headers: this.httpOptionsWindowsAuth });
    }
    updateCompanyById(id: any, company: any): Observable<any> {     
        return this.http.put<any>(`${this.base}/Companies/updatecompany/${id}`, company, { headers: this.httpOptionsWindowsAuth });
    }
    // Groups API Calls
    getGroups(companyId: any){     
        return this.http.get<any>(`${this.base}/Groups?companyId=${companyId}`, { headers: this.httpOptionsWindowsAuth });
    }

    createGroup(group: any): Observable<any> {     
        return this.http.post<any>(`${this.base}/Groups/creategroup`, group, { headers: this.httpOptionsWindowsAuth });
    }

    getGroupById(id: any): Observable<any> {     
        return this.http.get<any>(`${this.base}/Groups/getgroupbyid/${id}`, { headers: this.httpOptionsWindowsAuth });
    }

    updateGroupById(id: any, group: any): Observable<any> {     
        return this.http.put<any>(`${this.base}/Groups/updategroup/${id}`, group, { headers: this.httpOptionsWindowsAuth });
    }
  // Account Groups API Calls
    getAccountGroups(companyId: any){     
        return this.http.get<any>(`${this.base}/AccountGroups?companyId=${companyId}`, { headers: this.httpOptionsWindowsAuth });
    }
    createAccountGroup(accountGroup: any): Observable<any> {     
        return this.http.post<any>(`${this.base}/AccountGroups/createaccountgroup`, accountGroup, { headers: this.httpOptionsWindowsAuth });
    }
    getAccountGroupById(id: any): Observable<any> {     
        return this.http.get<any>(`${this.base}/AccountGroups/getaccountgroupbyid/${id}`, { headers: this.httpOptionsWindowsAuth });
    }
    updateAccountGroupById(id: any, accountGroup: any): Observable<any> {     
        return this.http.put<any>(`${this.base}/AccountGroups/updateaccountgroup/${id}`, accountGroup, { headers: this.httpOptionsWindowsAuth });
    }
    // Accounts API Calls
    getAccountsByCompanyId(companyId: any){     
        return this.http.get<any>(`${this.base}/Accounts/getaccountbycompanyid/${companyId}`, { headers: this.httpOptionsWindowsAuth });
    }
    createAccount(account: any): Observable<any> {     
        return this.http.post<any>(`${this.base}/Accounts/createaccount`, account, { headers: this.httpOptionsWindowsAuth });
    }
    getAccountById(id: any): Observable<any> {     
        return this.http.get<any>(`${this.base}/Accounts/getaccountbyid/${id}`, { headers: this.httpOptionsWindowsAuth });
    }
    updateAccountById(id: any, account: any): Observable<any> {     
        return this.http.put<any>(`${this.base}/Accounts/updateaccount/${id}`, account, { headers: this.httpOptionsWindowsAuth });
    }
    // States API Calls
    getStates(){     
        return this.http.get<any>(`${this.base}/States/getallstates`, { headers: this.httpOptionsWindowsAuth });
    }   

    // Vehicles API Calls
    getVehiclesByCompanyId(companyId: any) {     
        return this.http.get<any>(`${this.base}/Vehicles/getvehiclebycompanyid/${companyId}`,{ headers: this.httpOptionsWindowsAuth });
    }
    getVehicleById(id: any): Observable<any> {     
        return this.http.get<any>(`${this.base}/Vehicles/getvehiclebyid/${id}`,{ headers: this.httpOptionsWindowsAuth });
    }
    createVehicle(vehicle: any): Observable<any> {     
        return this.http.post<any>(`${this.base}/Vehicles/createvehicle`,vehicle,{ headers: this.httpOptionsWindowsAuth });
    }
    updateVehicleById(id: any, vehicle: any): Observable<any> {     
        return this.http.put<any>(`${this.base}/Vehicles/updatevehicle/${id}`,vehicle,{ headers: this.httpOptionsWindowsAuth });
    }
    deleteVehicle(id: any): Observable<any> {
        return this.http.delete<any>(`${this.base}/Vehicles/deletevehicle/${id}`,{ headers: this.httpOptionsWindowsAuth });
    }
    softDeleteVehicle(id: any): Observable<any> {
        return this.http.put<any>(`${this.base}/Vehicles/soft/${id}`,{ headers: this.httpOptionsWindowsAuth });
    }    
    searchVehicles(term: string, companyId: number): Observable<any> {
            const body = { companyId: companyId, term: term };
        return this.http.post<any>(`${this.base}/Vehicles/searchvehicles`, body, { headers: this.httpOptionsWindowsAuth } );
  }
    changePassword(payload: any): Observable<any> {     
        return this.http.post<any>(`${this.base}/Auth/changepassword`,payload,{ headers: this.httpOptionsWindowsAuth });
    }
}
