import { Component, AfterViewInit } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { Sensor } from '../entity/sensor';
import { Payload, PayloadType } from '../payloads/payload';
import { SensorsSharedService } from './sensors-shared.service';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../service/cra.service';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { DropdownModule } from "ng2-dropdown";

@Component({
  selector: 'side-menu',
  templateUrl: 'app/components/side.menu.component.html',
  styleUrls: ['app/components/side.menu.component.css'],
  // directives: [DROPDOWN_DIRECTIVES]
})
export class SideMenuComponent {
  private title = "Noise Map";
  private sensors: Sensor[] = [];

  private devicedetailParamsDefault = <DeviceDetailParams>{
    start: new Date(2016,9,15),
    stop: new Date(2016,09,22),
    order: Order.asc
  }

  private deviceGpsParams = <DeviceParams>{
    projectName: 'GPSinCars'
  };

  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
    sensorsSharedService.getSensors().subscribe((sensors: Sensor[]) => {
      this.sensors = sensors;
      log.debug("seznam: " + sensors)
    })

  }

  onClick(devEUI: string) {
    this.devicedetailParamsDefault.devEUI = devEUI;
    //this.sensorsSharedService.loadStatisticsData(this.devicedetailParamsDefault, this.deviceGpsParams);
  }
}