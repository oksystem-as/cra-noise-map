import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { SensorsSharedService, Overlay, OverlayGroup, Events } from '../sensors-shared.service';
import { ResponsiveState } from 'ng2-responsive';

@Component({
  selector: 'logo',
  templateUrl: 'app/components/map/logo.component.html',
  styleUrls: ['app/components/map/logo.component.css'],
})
export class LogoComponent {
private isPortraitInternal: boolean;

  constructor(responsiveState: ResponsiveState) {
    responsiveState.orientationObserver.subscribe(orientation => {
      this.isPortraitInternal = orientation === "portrait";
    })
  }

  isPortrait() {
    if (this.isPortraitInternal == undefined) {
      throw "isPortraitInternal neni definovan";
    }
    return this.isPortraitInternal;
  }
}
