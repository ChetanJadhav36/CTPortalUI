import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TailoringService {
  private base = environment.apiUrl;
    
    httpOptions: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      charset: 'UTF-8'
    });
  
    constructor(private http: HttpClient) { }
  
    // #region Measurements API

      // Get all measurements by company ID
      getMeasurementsByCompanyId(companyId: number): Observable<any> {
        return this.http.get<any>(`${this.base}/Measurements/getmeasurementsbycompanyid/${companyId}`, { headers: this.httpOptions });
      }

      // Get measurement by ID
      getMeasurementById(id: number): Observable<any> {
        return this.http.get<any>(`${this.base}/Measurements/getmeasurementbyid/${id}`, { headers: this.httpOptions });
      }

      // Get customer measurement history
      getCustomerHistory(payload: any): Observable<any> {
        return this.http.post<any>(`${this.base}/Measurements/customerhistory`, payload, { headers: this.httpOptions });
      }

      // Create measurement
      createMeasurement(payload: any): Observable<any> {
        return this.http.post<any>(`${this.base}/Measurements/createmeasurement`, payload, { headers: this.httpOptions });
      }

      // Update measurement
      updateMeasurement(id: number, payload: any): Observable<any> {
        return this.http.put<any>(`${this.base}/Measurements/updatemeasurement/${id}`, payload, { headers: this.httpOptions });
      }

      // Soft delete measurement
      softDeleteMeasurement(id: number): Observable<any> {
        return this.http.delete<any>(`${this.base}/Measurements/soft/${id}`, { headers: this.httpOptions });
      }

// #endregion
}
