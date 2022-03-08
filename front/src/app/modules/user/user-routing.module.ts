import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectComponent } from './project/project.component';
import { ProjectsOverviewComponent } from './projects-overview/projects-overview.component';
import { UserLayoutComponent } from './user-layout/user-layout.component';

const routes: Routes = [
  {path: "", component: UserLayoutComponent, 
    children: [
      {path: "project/:id", component: ProjectComponent},
      {path: "projects", component: ProjectsOverviewComponent},
  ]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
