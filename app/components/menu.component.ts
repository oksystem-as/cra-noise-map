import { Component, AfterViewInit } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { SensorsSharedService } from './sensors-shared.service';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { DropdownModule } from "ng2-dropdown";

@Component({
  selector: 'menu',
  templateUrl: 'app/components/menu.component.html',
  styleUrls: ['app/components/menu.component.css'],
  // directives: [DROPDOWN_DIRECTIVES]
})
export class MenuComponent {
  private title = "Noise Map";
  private gps: ARF8084BAPayload[] = [];

  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
    sensorsSharedService.getGps().subscribe((gps: ARF8084BAPayload[]) => {
      this.gps = gps;
      log.debug("seznam: " + gps)
    })
  }
}