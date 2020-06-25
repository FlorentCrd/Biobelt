import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'remplissage', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'remplissage', loadChildren: './remplissage/remplissage.module#RemplissagePageModule' },
  { path: 'programmes', loadChildren: './programmes/programmes.module#ProgrammesPageModule' },
  { path: 'bouteille', loadChildren: './bouteille/bouteille.module#BouteillePageModule' },
  { path: 'move-bouteille', loadChildren: './move-bouteille/move-bouteille.module#MoveBouteillePageModule' },
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
