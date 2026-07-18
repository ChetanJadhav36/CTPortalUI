import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenUtility {
  
  /**
   * Decode a base64 JWT token string
   * @param token - The JWT token to decode
   * @returns Decoded token payload as generic type T
   */
  decodeToken<T>(token: string): T | null {
    try {
      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload) as T;
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  /**
   * Get decoded token from localStorage
   * @param tokenKey - The localStorage key (default: 'auth_token')
   * @returns Decoded token payload as generic type T
   */
  getDecodedToken<T>(tokenKey: string = 'auth_token'): T | null {
    const token = localStorage.getItem(tokenKey);
    return token ? this.decodeToken<T>(token) : null;
  }

  /**
   * Check if token is expired
   * @param tokenKey - The localStorage key (default: 'auth_token')
   * @returns true if token is expired, false otherwise
   */
  isTokenExpired(tokenKey: string = 'auth_token'): boolean {
    const decoded = this.getDecodedToken<any>(tokenKey);
    if (!decoded?.exp) return true;
    
    // exp is in seconds, Date.now() is in milliseconds
    return Date.now() >= decoded.exp * 1000;
  }

  /**
   * Get token expiration time
   * @param tokenKey - The localStorage key (default: 'auth_token')
   * @returns Expiration timestamp or null if invalid
   */
  getTokenExpiration(tokenKey: string = 'auth_token'): Date | null {
    const decoded = this.getDecodedToken<any>(tokenKey);
    if (!decoded?.exp) return null;
    
    return new Date(decoded.exp * 1000);
  }

  /**
   * Get time remaining before token expires (in seconds)
   * @param tokenKey - The localStorage key (default: 'auth_token')
   * @returns Remaining time in seconds, or -1 if expired
   */
  getTokenTimeRemaining(tokenKey: string = 'auth_token'): number {
    const decoded = this.getDecodedToken<any>(tokenKey);
    if (!decoded?.exp) return -1;
    
    const remaining = decoded.exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : -1;
  }

  /**
   * Extract specific claim from token
   * @param claim - The claim name to extract
   * @param tokenKey - The localStorage key (default: 'auth_token')
   * @returns The claim value or null
   */
  getTokenClaim<T = any>(claim: string, tokenKey: string = 'auth_token'): T | null {
    const decoded = this.getDecodedToken<any>(tokenKey);
    return decoded?.[claim] ?? null;
  }
}
