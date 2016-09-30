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
  selector: 'menu',
  templateUrl: 'app/components/menu.component.html',
  styleUrls: ['app/components/menu.component.css'],
  // directives: [DROPDOWN_DIRECTIVES]
})
export class MenuComponent {
  private title = "Noise Map";
  private sensors: Sensor[] = [];

  private devicedetailParamsDefault = <DeviceDetailParams>{
    start: new Date("2014-01-11"),
    //stop: new Date("2016-09-22"),
    order: Order.asc,
    //limit:10000
  }

  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
    sensorsSharedService.getSensor().subscribe((sensors: Sensor[]) => {
      this.sensors = sensors;
      this.log.debug("seznam: " + sensors)
    })

  }

  onClick(sensor: Sensor) {
    this.devicedetailParamsDefault.devEUI =sensor.devEUI;
    this.devicedetailParamsDefault.payloadType = sensor.payloadType;
    this.sensorsSharedService.loadStatisticsData(this.devicedetailParamsDefault);
  }
}