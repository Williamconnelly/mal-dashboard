import { Injectable } from "@angular/core";
import { UserSettings } from "../types/media-types";


@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // TODO: Read/Save from IPC
  public settings = new UserSettings();

  constructor() {
    
  }

  public updateSetting(setting: string, value: any): void {
    this.settings[setting] = value;
  }

}
