import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './components/app.component';
import { MapComponent } from './components/map.component';
import { TestComponent } from './components/test.component';
import { SliderComponent } from './components/slider.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { StatisComponent } from './components/statistics/statis.component';
import { TabsStatisComponent } from './components/statistics/tabs.statis.component';
import { TableStatisComponent } from './components/statistics/table.statis.component';
import { OverlaysMenuComponent } from './components/map/overlays.menu.component';
import { BaseMapLegendComponent } from './components/map/base.map.legend.component';
import { SearchComponent } from './components/map/search.component';
import { OverlaysSearchComponent } from './components/map/overlays.search.component';
import { LogoComponent } from './components/map/logo.component';
import { LoadingComponent } from './components/loading.component';
import { HttpModule }    from '@angular/http';
import { Logger, Options, Level  } from "angular2-logger/core"; 
import { DropdownModule } from "ng2-dropdown";
import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
import { ResponsiveModule } from 'ng2-responsive';

import { CRaService } from './service/cra.service';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { Collapse } from "./directives/collapse.directive"

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpModule,
    DropdownModule,
    ChartsModule,
    Ng2BootstrapModule,
    ResponsiveModule,
  ],
  providers: [CRaService,{ provide: Options, useValue: { store: true, level: Level.ERROR } },  Logger],
  declarations: [
    AppComponent,
    MapComponent,
    TestComponent,
    SliderComponent,
    StatisticsComponent,
    StatisComponent,
    TabsStatisComponent,
    TableStatisComponent,
    OverlaysMenuComponent,
    BaseMapLegendComponent,
    OverlaysSearchComponent,
    SearchComponent,
    LogoComponent,
    LoadingComponent,
    // Collapse,
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }