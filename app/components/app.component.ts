import { Component, AfterViewInit } from '@angular/core';
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService } from './sensors-shared.service';

@Component({
  providers: [
    SensorsSharedService
  ],
  selector: 'app-root',
  templateUrl: 'app/components/app.component.html',
  styleUrls: ['app/components/app.component.css'],
})
export class AppComponent{ }