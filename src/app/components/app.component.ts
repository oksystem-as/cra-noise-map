import { Component, AfterViewInit, ViewContainerRef } from '@angular/core';
import { SensorsSharedService } from './sensors-shared.service';
import * as Raven from 'raven-js';

@Component({
  providers: [
    SensorsSharedService
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  private viewContainerRef: ViewContainerRef;

  public constructor(viewContainerRef: ViewContainerRef) {
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef;
  }

  ngAfterViewInit(): void {
    Raven.captureMessage('Application view is initialized.', {
      level: 'info' 
    });
  }

}