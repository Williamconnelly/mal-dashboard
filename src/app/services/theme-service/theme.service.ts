import { Injectable, Inject, EventEmitter } from '@angular/core';
import { Theme, ACTIVE_THEME, THEMES } from '../../types/themes';

@Injectable()
export class ThemeService {

  public themeChange = new EventEmitter<Theme>();

  constructor(
    @Inject(THEMES) public themes: Theme[], 
    @Inject(ACTIVE_THEME) public theme: string
  ) { }

  public getTheme(name: string): Theme {
    const theme = this.themes.find(t => t.name === name);
    if (!theme) {
      throw new Error(`Theme not found: '${name}'`);
    }
    return theme;
  }

  public getAllThemes(): Theme[] {
    return this.themes;
  }

  public getActiveTheme() {
    return JSON.parse(JSON.stringify(this.getTheme(this.theme)));
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

  public updateCustomTheme(theme: Theme): void {
    this.themeChange.emit(theme);
  }

}

