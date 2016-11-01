import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { ResponsiveState } from 'ng2-responsive';

@Component({
  selector: 'about-app',
  templateUrl: 'app/components/about.app.component.html',
  styleUrls: ['app/components/about.app.component.css'],
})
export class AboutAppComponent {
  private isMobileIntrenal : boolean;

  constructor(private log: Logger, responsiveState: ResponsiveState ) {
    if (log != undefined) {
    this.log.debug("responsiveState: ", responsiveState);
    }
    
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