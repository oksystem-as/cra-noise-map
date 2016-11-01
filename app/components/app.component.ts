import { Component, AfterViewInit, ViewContainerRef } from '@angular/core';
import { SensorsSharedService } from './sensors-shared.service';

@Component({
  providers: [
    SensorsSharedService
  ],
  selector: 'app-root',
  templateUrl: 'app/components/app.component.html',
  styleUrls: ['app/components/app.component.css'],
})
export class AppComponent {

  private viewContainerRef: ViewContainerRef;

  public constructor(viewContainerRef: ViewContainerRef) {
    // You need this small hack in order to catch application root view container ref
    this.viewContainerRef = viewContainerRef;
  }
}