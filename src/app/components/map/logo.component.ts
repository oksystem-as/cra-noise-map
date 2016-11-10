import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { SensorsSharedService, Overlay, OverlayGroup, Events } from '../sensors-shared.service';
import { ResponsiveState } from 'ng2-responsive';

@Component({
  selector: 'logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.css'],
})
export class LogoComponent {
}
