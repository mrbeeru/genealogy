import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { ProjectComponent } from './project/project.component';
import { UserLayoutComponent } from './user-layout/user-layout.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectsOverviewComponent } from './projects-overview/projects-overview.component';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import { CreateProjectDialogComponent } from './create-project-dialog/create-project-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DefaultviewComponent } from '../public/defaultview/defaultview.component';
import { PublicModule } from '../public/public.module';

@NgModule({
  declarations: [
    ProjectComponent,
    UserLayoutComponent,
    ProjectsOverviewComponent,
    CreateProjectDialogComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    PublicModule
  ]
})
export class UserModule { }
