import { Component, AfterViewInit } from '@angular/core';
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
}