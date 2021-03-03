import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ThemeService } from 'src/app/services/theme-service/theme.service';
import { Theme } from 'src/app/types/themes';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {

  public availableThemes$ = new BehaviorSubject<Theme[]>(null);

  public customTheme: Theme;

  private currentActiveTheme: Theme;

  private themeChange$ = new Subject<Theme>();

  private _destroy$ = new Subject<boolean>();

  public themeError$ = new BehaviorSubject<string>('');

  constructor(private _theme: ThemeService) { 
    this.availableThemes$.next(this._theme.getAllThemes());
    this.currentActiveTheme = this._theme.getActiveTheme();
    this.themeChange$.pipe(
      debounceTime(100),
      takeUntil(this._destroy$)
    ).subscribe(
      theme => {
        this._theme.updateCustomTheme(theme);
      }
    )
  }

  ngOnInit() {

  }

  createTheme(): void {
    this.customTheme = this._theme.getActiveTheme();
    this.customTheme.name = 'NewTheme';
  }

  public updateColor(color: string, property: string): void {
    this.customTheme.properties[property] = color;
    this.themeChange$.next(this.customTheme);
  }

  public saveTheme(): void {
    if (!this.customTheme.name) {
      this.themeError$.next('Custom Theme requires a name');
    }
    console.log(this.customTheme.properties);
    this._theme.updateCustomTheme(this.customTheme);
  }

  public updateName(name: string) {
    if (name.includes(' ')) {
      this.themeError$.next('Theme name cannot contain spaces');
      return;
    }
    if (this.availableThemes$.value.map(theme => theme.name).includes(name)) {
      this.themeError$.next('Theme name already exists');
      return;
    }
    this.customTheme.name = name;
    this.themeError$.next('');
  }

  public cancelTheme() {
    this.customTheme = null;
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
