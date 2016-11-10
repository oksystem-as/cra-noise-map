import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { ResponsiveState } from 'ng2-responsive';

@Component({
  selector: 'controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.css'],
})
export class ControlsComponent {
  private isMobileIntrenal: boolean;
  private isTabletIntrenal: boolean;

  constructor(responsiveState: ResponsiveState) {
    responsiveState.deviceObserver.subscribe(device => {
      this.isMobileIntrenal = device === "mobile";
      this.isTabletIntrenal = device === "tablet";
    })
  }

  isMobile() {
    if (this.isMobileIntrenal == undefined) {
      throw "isMobileIntrenal neni definovan";
    }
    return this.isMobileIntrenal;
  }

  isTablet() {
    if (this.isTabletIntrenal == undefined) {
      throw "isTabletIntrenal neni definovan";
    }
    return this.isTabletIntrenal;
  }
}