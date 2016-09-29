import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './components/app.component';
import { MapComponent } from './components/map.component';
import { MenuComponent } from './components/menu.component';
import { SideMenuComponent } from './components/side.menu.component';
import { TestComponent } from './components/test.component';
import { SliderComponent } from './components/slider.component';
import { StatisticsComponent } from './components/statistics.component';
import { HttpModule }    from '@angular/http';
import { Logger, Options, Level  } from "angular2-logger/core"; 
import { DropdownModule } from "ng2-dropdown";

import { CRaService } from './service/cra.service';
import { ChartsModule } from 'ng2-charts/ng2-charts';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpModule,
    DropdownModule,
    ChartsModule,
  ],
  providers: [CRaService,{ provide: Options, useValue: { store: true, level: Level.ERROR } },  Logger],
  declarations: [
    AppComponent,
    MapComponent,
    MenuComponent,
    TestComponent,
    SliderComponent,
    StatisticsComponent,
    SideMenuComponent,
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }