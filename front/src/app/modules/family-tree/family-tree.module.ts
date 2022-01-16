import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FamilyTreeRoutingModule } from './family-tree-routing.module';
import { DefaultviewComponent } from './components/defaultview/defaultview.component';


@NgModule({
  declarations: [
    DefaultviewComponent
  ],
  imports: [
    CommonModule,
    FamilyTreeRoutingModule
  ]
})
export class FamilyTreeModule { }
