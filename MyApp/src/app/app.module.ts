import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Router, Routes as NgRoutes, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { JsonServiceClient } from '@servicestack/client';
import { ServiceStackModule, ForbiddenComponent } from '@servicestack/angular';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

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
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ServiceStackModule,
    RouterModule.forRoot(routes)
  ],
  providers: [{provide: JsonServiceClient, useValue: new JsonServiceClient('/')}],
  bootstrap: [AppComponent]
})
export class AppModule { }
