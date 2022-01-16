import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const viewModule = () => import('./modules/family-tree/family-tree.module').then(x => x.FamilyTreeModule);
const manageModule = () => import('./modules/manage/manage.module').then(x => x.ManageModule);


const routes: Routes = [
  {path: 'view', loadChildren: viewModule},
  {path: 'manage', loadChildren: manageModule}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
