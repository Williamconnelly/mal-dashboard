import { Injectable } from '@angular/core';
import { ipcMain, IpcRenderer } from 'electron';
import { BehaviorSubject, Observable } from 'rxjs';
import { MALService } from './mal.service';

@Injectable({
  providedIn: 'root'
})
export class IPCService {

  private _ipc: IpcRenderer;

  public get renderer(): IpcRenderer {
    return this._ipc;
  }

  public set renderer(ipc: IpcRenderer) {
    this._ipc = ipc;
  }

  constructor() {
    if ((<any>window).require) {
      try {
        this._ipc = (<any>window).require('electron').ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }

  }
    // public authorizeUser(): string {
    //   const baseUrl = 'https://myanimelist.net/v1/oauth2/authorize';
    //   const response_type = 'code';
    //   // const code_challenge = this.generateRandomString();
    //   const code_challenge = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    //   // TODO: Remove
    //   // this.code_challenge = code_challenge;
    //   console.log(code_challenge)
    //   const state = 'exampleState';
    //   const url = `${baseUrl}?response_type=${response_type}&code_challenge=${code_challenge}&state=${state}`;
    //   return url;
    // }
}

