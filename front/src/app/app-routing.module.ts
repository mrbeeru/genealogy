import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectComponent } from './modules/user/project/project.component';

const publicModule = () => import('./modules/public/public.module').then(x => x.PublicModule);
const userModule = () => import('./modules/user/user.module').then(x => x.UserModule);

const routes: Routes = [
  {path: '', component: ProjectComponent},
  {path: 'user', loadChildren: userModule},
  {path: 'public', loadChildren: publicModule},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
