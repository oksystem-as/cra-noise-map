import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './components/app.component';
import { MapComponent } from './components/map.component';
import { MenuComponent } from './components/menu.component';
import { TestComponent } from './components/test.component';
import { SliderComponent } from './components/slider.component';
import { HttpModule }     from '@angular/http';

import { CRaService } from './service/cra.service';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpModule
  ],
  providers: [CRaService],
  declarations: [
    AppComponent,
    MapComponent,
    MenuComponent,
    TestComponent,
    SliderComponent,
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }