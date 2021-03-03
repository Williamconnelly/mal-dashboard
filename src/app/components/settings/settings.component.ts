import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService } from 'src/app/services/theme-service/theme.service';
import { Theme } from 'src/app/types/themes';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  public availableThemes$ = new BehaviorSubject<Theme[]>(null);

  public customTheme: Theme;

  constructor(private _theme: ThemeService) { 
    console.log(this._theme.getAllThemes());
    this.availableThemes$.next(this._theme.getAllThemes());
  }

  ngOnInit() {

  }

  createTheme(): void {
    this.customTheme = {...this._theme.getActiveTheme()};
  }

  public updateColor(color: string, property: string): void {
    this.customTheme.properties[property] = color;
  }

  public saveTheme(): void {
    console.log(this.customTheme.properties);
  }

  public updateName(name: string) {
    this.customTheme.name = name;
  }

  public cancelTheme() {
    this.customTheme = null;
  }

}
