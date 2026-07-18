import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TokenUtility } from './token.utility';
import { PermissionAction } from '../enums/permission.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;
  private tokenKey = 'auth_token';
  private _isLoggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem(this.tokenKey));
  isLoggedIn$ = this._isLoggedIn.asObservable();
  private _permissions: any[] = [];

  constructor(
    private http: HttpClient,
    private tokenUtility: TokenUtility
  ) {}

  httpOptionsWindowsAuth: HttpHeaders =
    new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain',
      charset: 'UTF-8',
    }); 
    
  login(credentials: {email:string, password:string}): Observable<any> {
    return this.http.post(`${this.base}/Auth/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem(this.tokenKey, res.token);
        this._isLoggedIn.next(true);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this._isLoggedIn.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  /**
   * Helper to get specific user info from the token
   */
  getUserAuthData() {
  const token = this.tokenUtility.getDecodedToken<any>();
  if (!token) return null;
  const clientData : any = {};
    JSON.parse(token.client).forEach((data: any, index: number) => {
      if(index === 0) clientData.clientId = data;
      else if(index === 1) clientData.clientName = data;
      else if(index === 2) clientData.clientCode = data;
    });

  let permissions: any[] = [];

  if (Array.isArray(token.page_permissions)) {
    permissions = token.page_permissions.flatMap((p: string) =>
      JSON.parse(p)
    );
  } else if (token.page_permissions) {
    permissions = JSON.parse(token.page_permissions);
  }

  this._permissions = permissions; // ✅ cache here

  return {
    userId: token.userId,
    roles: Array.isArray(token.role) ? token.role : [token.role],
    permissions,
    client: clientData,
  };
}

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    const data = this.getUserAuthData();
    return data?.permissions.includes(permission) ?? false;
  }
  getPermissions(): any[] {
  if (!this._permissions.length) {
    this.getUserAuthData();
  }

  return this._permissions;
  }
    
  /**
   * Automatically retrieves the profile for the currently logged-in user
   * based on the ID stored in the JWT.
   */
  getUserProfile(): Observable<any> {
    const tokenData = this.tokenUtility.getDecodedToken<any>(); // Replace 'any' with your DecodedToken interface    
    const userId = tokenData?.userId;

    if (!userId) {
      throw new Error('User ID not found in token');
    }

    // Call the GET API name we suggested earlier: GET /api/users/{id}
    return this.http.get<any>(`${this.base}/Auth/getuserprofilebyid/${userId}`);
  }
  onRegister(formData:any): Observable<any> {
    return this.http.post(`${this.base}/Auth/register`, formData);
  }
}

