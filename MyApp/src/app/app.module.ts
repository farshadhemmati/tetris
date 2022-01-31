import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Router, Routes as NgRoutes, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { JsonServiceClient } from '@servicestack/client';
import { ServiceStackModule, ForbiddenComponent } from '@servicestack/angular';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RemoveCommaPipe } from './shared/pipes/removeComma.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';

export const routes: NgRoutes = [
  {
      path: '',
      redirectTo: '/',
      pathMatch: 'full'
  },
  { path: '', component: HomeComponent, data: { title: 'Home', name: 'Angular 13' } },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RemoveCommaPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ServiceStackModule,
    MatButtonModule,

    RouterModule.forRoot(routes),


    BrowserAnimationsModule
  ],
  providers: [{provide: JsonServiceClient, useValue: new JsonServiceClient('/')}],
  bootstrap: [AppComponent]
})
export class AppModule { }
