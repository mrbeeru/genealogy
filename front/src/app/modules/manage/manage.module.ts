import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageRoutingModule } from './manage-routing.module';
import { PersonManagerComponent } from './components/person-manager/person-manager.component';


@NgModule({
  declarations: [
    PersonManagerComponent
  ],
  imports: [
    CommonModule,
    ManageRoutingModule
  ]
})
export class ManageModule { }
