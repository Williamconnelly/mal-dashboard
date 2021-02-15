import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
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

  private list = new BehaviorSubject<UserList>(null);

  // Included in getUserList request
  private enabledRequestFields = [
    'id',
    'title',
    'main_picture',
    'alternative_titles',
    'start_date',
    'end_date',
    'synopsis',
    'mean',
    'rank',
    'popularity',
    'num_list_users',
    'num_scoring_users',
    'nsfw',
    'created_at',
    'updated_at',
    'media_type',
    'status',
    'genres',
    'my_list_status',
    'num_episodes',
    'start_season',
    'broadcast',
    'source',
    'average_episode_duration',
    'rating',
    'pictures',
    'background',
    'related_anime',
    'related_manga',
    'recommendations',
    'studios',
    'statistics'
  ];

  constructor(
    private _http: HttpClient, 
    private _ipc: IPCService,
    private _zone: NgZone
  ) { 
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
    this._http.post<MalTokenResponse>(url, formData).pipe(
      (take(1))
    ).subscribe(
      tokenInfo => {
        this.malTokenInfo = tokenInfo;
        // Store new token
        this.storeRefreshToken();
        // Populate MAL List
        this.getUserList().pipe(
          take(1)
        ).subscribe(
          list => {
            this.list.next(list);
          }, 
          err => {
            console.error('Failed to retrieve MAL user list', err);
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
    this._ipc.renderer.once('token-refreshed', (event, authResponse: MalRefreshResponse ) => {
      // Run ipc callback in zone to notify Angular
      this._zone.run(() => this.updateAccessToken(authResponse));
    });
  }

  // Helper CB method for refreshAccessToken
  private updateAccessToken(authResponse: MalRefreshResponse) {
      if (authResponse) {
        const url = 'https://myanimelist.net/v1/oauth2/token';
        const formData = new FormData();
        formData.append('client_id', authResponse.cId);
        formData.append('client_secret', authResponse.cS);
        formData.append('grant_type', 'refresh_token');
        formData.append('refresh_token', authResponse.refresh_token);
        this._http.post<MalTokenResponse>(url, formData).pipe(
          take(1)
        ).subscribe(
          res => {
            this.malTokenInfo = res;
            this.storeRefreshToken();
            this.getUserList().pipe(
              take(1)
            ).subscribe(
              list => {
                this.list.next(list);
              }, 
              err => {
                console.error(err);
              }
            );
          },
          err => {
            console.error(err);
          }
        )
      }
  }

  // TODO: Temporary auth method
  public getCurrentUser(): Observable<object> {
    const url = 'https://api.myanimelist.net/v2/users/@me';
    const headers = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.malTokenInfo.access_token}`)
    };
    return this._http.get(url, headers);
  }

  private getUserList(): Observable<UserList> {
    const baseUrl = 'https://api.myanimelist.net/v2/users/@me/animelist';
    const headers = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${this.malTokenInfo.access_token}`)
    };
    const includedFields = this.enabledRequestFields.toString();
    const url = `${baseUrl}?fields=${includedFields}&nsfw=true&limit=999`;
    return this._http.get<UserList>(url, headers);
  }

  public getListData(): BehaviorSubject<UserList> {
    return this.list;
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