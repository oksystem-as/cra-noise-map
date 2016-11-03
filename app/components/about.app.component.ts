import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { ResponsiveState } from 'ng2-responsive';

@Component({
  selector: 'about-app',
  templateUrl: 'app/components/about.app.component.html',
  styleUrls: ['app/components/about.app.component.css'],
})
export class AboutAppComponent {
  private isMobileIntrenal: boolean;

  constructor(responsiveState: ResponsiveState) {
    responsiveState.deviceObserver.subscribe(device => {
      this.isMobileIntrenal = device === "mobile";
    })
  }

  isMobile() {
    if (this.isMobileIntrenal == undefined) {
      throw "isMobileIntrenal neni definovan";
    }
    return this.isMobileIntrenal;
  }
}