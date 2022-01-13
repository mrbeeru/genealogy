import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DefaultviewComponent } from '../family-tree/defaultview/defaultview.component';

const routes: Routes = [
  {path: 'defaultview', component: DefaultviewComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FamilyTreeRoutingModule { }
