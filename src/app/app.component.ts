import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'electron-angular-demo';

  // public sanitizeImageUrl(imageUrl: string): SafeUrl {
  //   console.log(imageUrl);
  //   return this._sanitizer.bypassSecurityTrustUrl(imageUrl);
  // }

}
