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
import { CreateMemberDialogComponent } from './create-member-dialog/create-member-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  declarations: [
    ProjectComponent,
    UserLayoutComponent,
    ProjectsOverviewComponent,
    CreateProjectDialogComponent,
    CreateMemberDialogComponent
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
    PublicModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatSelectModule,
  ]
})
export class UserModule { }
