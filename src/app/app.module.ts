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
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ViewportResizeDirective } from './directives/viewport-resize.directive';
import { StatsComponent } from './components/stats/stats.component';
import { ExploreComponent } from './components/explore/explore.component';
import { SakugaComponent } from './components/sakuga/sakuga.component';
import { MediaViewComponent } from './components/media-view/media-view.component';
import { ThemeModule } from './services/theme-service/themes.module';
import { malTheme, devTheme, payprTheme, refreshingBlues } from './types/themes';
import { SettingsComponent } from './components/settings/settings.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticateComponent,
    ListComponent,
    ExpandedContentComponent,
    HeaderControlsComponent,
    FooterControlsComponent,
    ViewportResizeDirective,
    StatsComponent,
    ExploreComponent,
    SakugaComponent,
    MediaViewComponent,
    SettingsComponent,
    DropdownComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ScrollingModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    ThemeModule.forRoot({
      themes: [malTheme, devTheme, payprTheme, refreshingBlues],
      active: 'RefreshingBlues'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
