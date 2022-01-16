import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonManagerComponent } from './components/person-manager/person-manager.component';

const routes: Routes = [
  {path:"", component: PersonManagerComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageRoutingModule { }
