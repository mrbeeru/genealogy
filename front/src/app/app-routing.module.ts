import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const viewModule = () => import('./modules/family-tree/family-tree.module').then(x => x.FamilyTreeModule);


const routes: Routes = [
  {path: 'view', loadChildren: viewModule},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
