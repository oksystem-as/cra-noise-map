import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { MapComponent } from './../map.component';
import { SensorsSharedService, Overlay, OverlayGroup, Events } from '../sensors-shared.service';

@Component({
  selector: 'mobile-top',
  templateUrl: 'app/components/mobile/mobile.top.component.html',
  styleUrls: ['app/components/mobile/mobile.top.component.css'],
})

export class MobileTopComponent {
 
}