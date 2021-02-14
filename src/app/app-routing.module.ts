import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticateComponent } from './components/authenticate/authenticate.component';
import { ListComponent } from './components/list/list.component';

const routes: Routes = [
  // {path: '', component: AuthenticateComponent, pathMatch: 'full'}
  {path: '', component: ListComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
