import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { ResponsiveState } from 'ng2-responsive';
import { Version } from '../version';

@Component({
  selector: 'about-app',
  templateUrl: './about.app.component.html',
  styleUrls: ['./about.app.component.css'],
})
export class AboutAppComponent {
  private isMobileIntrenal: boolean;
  private appVersion = Version.version;

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