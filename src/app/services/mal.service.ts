import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ipcMain, IpcRenderer } from 'electron';
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { UserList } from '../types/mal-types';
import { IPCService } from './ipc.service';

interface MalAuthResponse {
  cId: string,
  cS: string,
  code: string,
  state: string
};

interface MalTokenResponse {
  access_token: string,
  expires_in: number,
  refresh_token: string,
  token_type: string
};

interface MalRefreshResponse {
  cId: string,
  cS: string,
  refresh_token: string
}

@Injectable({
  providedIn: 'root'
})
export class MALService {

  private malAuthInfo: MalAuthResponse;

  private malTokenInfo: MalTokenResponse;

  private malList: any;

  constructor(
    private _http: HttpClient, 
    private _ipc: IPCService
  ) { 
    console.log('resfrfes');
    this.refreshAccessToken();
  }

  public authorizeUser() {
    const baseUrl = 'https://myanimelist.net/v1/oauth2/authorize';
    const response_type = 'code';
    const code_challenge = this.generateRandomString();
    const state = 'authUser';
    const url = `${baseUrl}?response_type=${response_type}&code_challenge=${code_challenge}&state=${state}`;
    // Prompt request from IPC
    this._ipc.renderer.send('authorize-user', url);
    // Listen for response from authentication request
    this._ipc.renderer.once('user-authenticated', (event, authInfo: MalAuthResponse) => {
      // Check for positive auth response
      if (authInfo) {
        this.malAuthInfo = authInfo;
        this.getUserAccessToken(code_challenge);
      }
    })
  }  

  private getUserAccessToken(codeVerifier: string) {
    const url = 'https://myanimelist.net/v1/oauth2/token';
    const formData = new FormData();
    // Construct form data for request
    formData.append('client_id', this.malAuthInfo.cId);
    formData.append('client_secret', this.malAuthInfo.cS);
    formData.append('code', this.malAuthInfo.code);
    formData.append('code_verifier', codeVerifier);
    formData.append('grant_type', 'authorization_code');
    this._http.post(url, formData).pipe(
      (take(1))
    ).subscribe(
      (res: MalTokenResponse) => {
        this.malTokenInfo = res;
        this.getCurrentUser().pipe(
          take(1)
        ).subscribe(
          res => {
            console.log('Current User', res);
            // Store new token
            this.storeRefreshToken();
          }
        );
      },
      err => {
        console.error('Failed to retrieve MAL access token', err);
      }
    )
  }

  // Update MALConfig
  private storeRefreshToken() {
    this._ipc.renderer.send('store-token', this.malTokenInfo.refresh_token);
  }



  // Check for refresh token and update Access Token in service
  private refreshAccessToken() {
    this._ipc.renderer.send('refresh-token');
    this._ipc.renderer.once('token-refreshed', (event, tokenInfo: MalRefreshResponse ) => {
      console.log(tokenInfo);
      if (tokenInfo) {
        const url = 'https://myanimelist.net/v1/oauth2/token';
        const formData = new FormData();
        formData.append('client_id', tokenInfo.cId);
        formData.append('client_secret', tokenInfo.cS);
        formData.append('grant_type', 'refresh_token');
        formData.append('refresh_token', tokenInfo.refresh_token);
        this._http.post<MalTokenResponse>(url, formData).pipe(
          take(1)
        ).subscribe(
          res => {
            this.malTokenInfo = res;
            console.log(this.malTokenInfo);
            this.storeRefreshToken();
            this.getList();
          },
          err => {
            console.error(err);
          }
        )
      }
    });
  }

  // TODO: Temporary auth method
  public getCurrentUser(): Observable<object> {
    const url = 'https://api.myanimelist.net/v2/users/@me';
    const headers = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.malTokenInfo.access_token}`)
    };
    return this._http.get(url, headers);
  }

  public getList(): Observable<UserList> {
    const baseUrl = 'https://api.myanimelist.net/v2/users/@me/animelist';
    const headers = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.malTokenInfo.access_token}`)
    };
    const url = `${baseUrl}?&limit=999`;
    return this._http.get<UserList>(url, headers);
  }

  // Generate a secure random string using the browser crypto functions
  public generateRandomString(): string {
    const array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => (`0${dec.toString(16).substr(-2)}`)).join('');
  }

  // Calculate the SHA256 hash of the input text. 
  // Returns a promise that resolves to an ArrayBuffer
  private sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
  }

  // Base64-urlencodes the input string
  private  base64urlencode(str) {
    // Convert the ArrayBuffer to string using Uint8 array to convert to what btoa accepts.
    // btoa accepts chars only within ascii 0-255 and base64 encodes them.
    // Then convert the base64 encoded to base64url encoded
    //   (replace + with -, replace / with _, trim trailing =)
    return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Return the base64-urlencoded sha256 hash for the PKCE challenge 
  private async pkceChallengeFromVerifier(v) {
    const hashed = await this.sha256(v);
    return this.base64urlencode(hashed);
  }



}