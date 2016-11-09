import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './components/app.component';
import { MapComponent } from './components/map.component';
import { TestComponent } from './components/test/test.component';
import { TabTestComponent } from './components/test/test.tabs.char.component';
import { SliderComponent } from './components/slider.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { StatisComponent } from './components/statistics/statis.component';
import { SliderStatisComponent } from './components/statistics/slider.component';
import { TabsStatisComponent } from './components/statistics/tabs.statis.component';
import { TableStatisComponent } from './components/statistics/table.component';
import { ChartComponent } from './components/statistics/chart.component';
import { SenzorMenuComponent } from './components/statistics/senzor.menu.component';
import { OverlaysMenuComponent } from './components/map/overlays.menu.component';
import { BaseMapLegendComponent } from './components/map/base.map.legend.component';
import { SearchComponent } from './components/map/search.component';
import { OverlaysSearchComponent } from './components/map/overlays.search.component';
import { LogoComponent } from './components/map/logo.component';
import { LoadingComponent } from './components/loading.component';
import { AboutAppComponent } from './components/about.app.component';
import { ControlsComponent } from './components/controls.component';

import { HttpModule } from '@angular/http';
import { Logger, Options, Level } from "angular2-logger/core";
// import { DropdownModule } from "ng2-dropdown";

import { ResponsiveModule } from 'ng2-responsive';

import { CRaService } from './service/cra.service';
import { Collapse } from "./directives/collapse.directive"

import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
import { ModalModule } from 'ng2-bootstrap/ng2-bootstrap';
import { CarouselModule } from 'ng2-bootstrap/ng2-bootstrap';
import { DropdownModule } from 'ng2-bootstrap/ng2-bootstrap';
import { ReversePipe } from './pipes/reverse.pipe';
import { Version } from './version';

import Raven = require('raven-js');

Raven
  .config('https://69322a4765c24abfa3ef6245331b4b43@sentry.io/112562', {
    tags: { git_commit: Version.version }
  })
  .install();

class RavenErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    Raven.captureException(err.originalError);
  }
}

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpModule,
    DropdownModule,
    Ng2BootstrapModule,
    ResponsiveModule,
    ModalModule,
    CarouselModule,
  ],
  providers: [
    CRaService,
    { provide: Options, useValue: { store: true, level: Level.ERROR } },
    Logger,
    { provide: ErrorHandler, useClass: RavenErrorHandler }
  ],
  declarations: [
    ReversePipe,
    AppComponent,
    MapComponent,
    TestComponent,
    TabTestComponent,
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
    ChartComponent,
    SenzorMenuComponent,
    SliderStatisComponent,
    AboutAppComponent,
    ControlsComponent,
    // Collapse,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }