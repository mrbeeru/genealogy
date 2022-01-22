import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultviewComponent } from './defaultview/defaultview.component';
import { MembersComponent } from './members/members.component';

const routes: Routes = [
  {path: "members", component: MembersComponent},
  {path: "", component: DefaultviewComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
