import { Component, AfterViewInit } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { Sensor } from '../entity/sensor';
import { Payload, PayloadType } from '../payloads/payload';
import { SensorsSharedService, Events } from './sensors-shared.service';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../service/cra.service';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { DropdownModule } from "ng2-dropdown";
import { ObjectUtils, ColorUtils, ArrayUtils } from '../utils/utils';

@Component({
  selector: 'menu',
  templateUrl: 'app/components/menu.component.html',
  styleUrls: ['app/components/menu.component.css'],
  // directives: [DROPDOWN_DIRECTIVES]
})
export class MenuComponent {
  private title = "Noise Map";
  private sensors: Sensor[] = [];
  // private sensorsAnimate: Sensor[] = [];
  private selectedSensor: Sensor;

  private init = true;

  private devicedetailParamsDefault = <DeviceDetailParams>{
    start: new Date(2014, 1, 11),
    //stop: new Date("2016-09-22"),
    order: Order.asc,
    //limit:10000
  }


  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
    // sensorsSharedService.getStatisticsData().subscribe((sensor: Sensor) => {
    //   // provedu aktualizaci puvodniho sensoru na novy ktery obsahuje vsechny payloady
    //   // - nutne jelikoz se tyto hodnoty mohou dal pouzivat
    //   ArrayUtils.replaceObject(this.sensorsAnimate, sensor, (sen) => { return sen.devEUI === sensor.devEUI })
    // })

    this.sensorsSharedService.getSensors()
    .filter((sensors) => {
      return sensors != undefined && sensors.length > 0;
    }).subscribe((sensors: Sensor[]) => {
      this.sensors = sensors;
      // if (this.init) {
      //   this.sensorsAnimate = sensors.slice(0);
      //   this.init = false;
      // }
    })

    // zvyrazneni vybraneho
    this.sensorsSharedService.listenEventData(Events.selectSensor).subscribe((sensor: Sensor) => {
      this.selectedSensor = sensor;
    });

  }

  private isSensorOnMap(sensor: Sensor): boolean {
    let containsGPS = false;

    if (sensor.payloads != undefined && sensor.payloads.length > 0) {
      sensor.payloads.forEach(payload => {
        if (payload.payloadType === PayloadType.ARF8084BA) {
          let pay = payload as ARF8084BAPayload;
          if (pay.status.GPSInfoIsPresent) {
            containsGPS = true;
          }
        }
      })
    }
    return containsGPS;
  }

  private isSensorSelected(sensor: Sensor): boolean {
    if (this.selectedSensor != undefined) {
      if (sensor.devEUI === this.selectedSensor.devEUI) {
        return true;
      }
    }
    return false;
  }

  private onClickAnim(sensor: Sensor) {
    this.sensorsSharedService.setAnimationSensor(sensor);
    this.sensorsSharedService.publishEvent(Events.runAnimation, sensor, "MenuComponent.onClickAnim");
  }

  private onClick(sensor: Sensor) {
    this.selectedSensor = sensor;
    this.sensorsSharedService.publishEvent(Events.selectSensor, sensor, "MenuComponent.onClick")
    this.devicedetailParamsDefault.devEUI = sensor.devEUI;
    this.devicedetailParamsDefault.payloadType = sensor.payloadType;
    this.devicedetailParamsDefault.publisher = "menuItem"
    this.sensorsSharedService.loadStatisticsData(this.devicedetailParamsDefault);
  }
}
