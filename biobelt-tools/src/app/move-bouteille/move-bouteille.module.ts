import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MoveBouteillePage } from './move-bouteille.page';

const routes: Routes = [
  {
    path: '',
    component: MoveBouteillePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MoveBouteillePage]
})
export class MoveBouteillePageModule {}
