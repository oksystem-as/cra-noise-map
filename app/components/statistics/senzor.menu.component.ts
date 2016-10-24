import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { MapComponent } from './../map.component';
import { SensorsSharedService, Overlay, OverlayGroup, Events } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { RxUtils, ObjectUtils, ArrayUtils } from '../../utils/utils';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../../service/cra.service';

@Component({
  selector: 'senzor-menu',
  templateUrl: 'app/components/statistics/senzor.menu.component.html',
  styleUrls: ['app/components/statistics/senzor.menu.component.css'],
})

export class SenzorMenuComponent {
  private sensors: Sensor[] = [];
  private selectedSensor: Sensor;

  private init = true;

  private devicedetailParamsDefault = <DeviceDetailParams> {
    start: new Date(2014, 1, 11),
    order: Order.asc,
  }

  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {

    this.sensorsSharedService.listenEventData(Events.loadSensor).filter((sensor) => { return sensor != undefined })
      .subscribe((sensor: Sensor) => {
        ArrayUtils.replaceOrAddObject(this.sensors, sensor, (sen) => { return sen.devEUI === sensor.devEUI })
        this.selectedSensor = null;
      })

    // zvyrazneni vybraneho
    this.sensorsSharedService.listenEventData(Events.selectSensor).subscribe((sensor: Sensor) => {
      this.selectedSensor = sensor;
    });

  }

  private isSensorOnMap(sensor: Sensor): boolean {
    return sensor.showData;
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