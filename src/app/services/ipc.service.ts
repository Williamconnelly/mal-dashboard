import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

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
}

