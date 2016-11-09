import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { SensorsSharedService, Overlay, OverlayGroup, Events } from '../sensors-shared.service';
import { ResponsiveState } from 'ng2-responsive';

@Component({
  selector: 'noise-label',
  templateUrl: 'app/components/map/noise.map.label.component.html',
  styleUrls: ['app/components/map/noise.map.label.component.css'],
})
export class NoiseLabelComponent {
}
