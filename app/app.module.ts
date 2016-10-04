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
import { StatisticsComponent } from './components/statistics/statistics.component';
import { StatisComponent } from './components/statistics/statis.component';
import { TabsStatisComponent } from './components/statistics/tabs.statis.component';
import { TableStatisComponent } from './components/statistics/table.statis.component';
import { TabsMapLegendComponent } from './components/map/tabs.map.legend.component';
import { HttpModule }    from '@angular/http';
import { Logger, Options, Level  } from "angular2-logger/core"; 
import { DropdownModule } from "ng2-dropdown";
import { MapLegendComponent } from './components/map.legend.component';
import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';

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
    Ng2BootstrapModule,
  ],
  providers: [CRaService,{ provide: Options, useValue: { store: true, level: Level.ERROR } },  Logger],
  declarations: [
    AppComponent,
    MapComponent,
    MenuComponent,
    TestComponent,
    SliderComponent,
    MapLegendComponent,
    StatisticsComponent,
    SideMenuComponent,
    StatisComponent,
    TabsStatisComponent,
    TableStatisComponent,
    TabsMapLegendComponent,
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }