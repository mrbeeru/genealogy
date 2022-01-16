import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageRoutingModule } from './manage-routing.module';
import { PersonManagerComponent } from './components/person-manager/person-manager.component';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    PersonManagerComponent
  ],
  imports: [
    CommonModule,
    ManageRoutingModule,
    MatFormFieldModule
  ]
})
export class ManageModule { }
