import { Component } from '@angular/core';
import { ThemeService } from './services/theme-service/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'electron-angular-demo';

  constructor(private _theme: ThemeService) {
    console.log(this._theme.getActiveTheme());
  }

  // public sanitizeImageUrl(imageUrl: string): SafeUrl {
  //   console.log(imageUrl);
  //   return this._sanitizer.bypassSecurityTrustUrl(imageUrl);
  // }

}
