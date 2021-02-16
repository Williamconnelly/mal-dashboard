import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticateComponent } from './components/authenticate/authenticate.component';
import { ListComponent } from './components/list/list.component';
import { ExpandedContentComponent } from './components/expanded-content/expanded-content.component';
import { HeaderControlsComponent } from './components/header-controls/header-controls.component';
import { FooterControlsComponent } from './components/footer-controls/footer-controls.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticateComponent,
    ListComponent,
    ExpandedContentComponent,
    HeaderControlsComponent,
    FooterControlsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
