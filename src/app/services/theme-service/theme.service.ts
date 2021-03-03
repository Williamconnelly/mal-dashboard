import { Injectable, Inject, EventEmitter } from '@angular/core';
import { Theme, ACTIVE_THEME, THEMES } from '../../types/themes';

@Injectable()
export class ThemeService {

  public themeChange = new EventEmitter<Theme>();

  constructor(
    @Inject(THEMES) public themes: Theme[], 
    @Inject(ACTIVE_THEME) public theme: string
  ) { }

  getTheme(name: string) {
    const theme = this.themes.find(t => t.name === name);
    if (!theme) {
      throw new Error(`Theme not found: '${name}'`);
    }
    return theme;
  }

  public getActiveTheme() {
    return this.getTheme(this.theme);
  }

  public getProperty(propName: string) {
    return this.getActiveTheme().properties[propName];
  }

  public setTheme(name: string) {
    this.theme = name;
    this.themeChange.emit( this.getActiveTheme());
  }

  public registerTheme(theme: Theme) {
    this.themes.push(theme);
  }

  public updateTheme(name: string, properties: { [key: string]: string; }) {
    const theme = this.getTheme(name);
    theme.properties = {
      ...theme.properties,
      ...properties
    };

    if (name === this.theme) {
      this.themeChange.emit(theme);
    }
  }

}

