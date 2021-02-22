import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticateComponent } from './components/authenticate/authenticate.component';
import { MediaViewComponent } from './components/media-view/media-view.component';
import { ExploreComponent } from './components/explore/explore.component';
import { ListComponent } from './components/list/list.component';
import { SakugaComponent } from './components/sakuga/sakuga.component';
import { StatsComponent } from './components/stats/stats.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'stats', component: StatsComponent }, 
  { path: 'explore', component: ExploreComponent },
  { path: 'sakuga', component: SakugaComponent },
  { path: 'list', component: ListComponent },
  { path: 'list/:id', component: MediaViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
