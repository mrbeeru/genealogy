import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { MembersComponent } from './members/members.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { DefaultviewComponent } from './defaultview/defaultview.component';
import {MatSliderModule} from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { HomepageComponent } from './homepage/homepage.component';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    MembersComponent,
    DefaultviewComponent,
    HomepageComponent,
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatSidenavModule,
    MatButtonModule,
    MatSliderModule,
    MatCardModule,
    FormsModule,
    DragDropModule
  ],
  exports:[DefaultviewComponent]
})
export class PublicModule { }
