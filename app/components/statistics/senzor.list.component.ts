import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { MapComponent } from './../map.component';
import { SensorsSharedService, Overlay, OverlayGroup, Events } from '../sensors-shared.service';

@Component({
  selector: 'senzor-list',
  templateUrl: 'app/components/statistics/senzor.list.component.html',
  styleUrls: ['app/components/statistics/senzor.list.component.css'],
})

export class SenzorListComponent {
 
}