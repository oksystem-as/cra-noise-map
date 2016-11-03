import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { MapComponent } from './../map.component';
import { SensorsSharedService, Overlay, OverlayGroup, Events } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { ObjectUtils, ArrayUtils } from '../../utils/utils';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../../service/cra.service';
import { StatisticsUtils, Statistics, Statistic, SensorStatistics } from '../../utils/statis-utils';

@Component({
  selector: 'senzor-menu',
  templateUrl: 'app/components/statistics/senzor.menu.component.html',
  styleUrls: ['app/components/statistics/senzor.menu.component.css'],
})

export class SenzorMenuComponent {
  private sensors: SensorStatistics[] = [];
  // private sensorsAnimate: Sensor[] = [];
  private selectedSensor: SensorStatistics;

  private init = true;
  // private sliderNewDate = SensorsSharedService.minDateLimit;

  private devicedetailParamsDefault = <DeviceDetailParams>{
    start: new Date(2014, 1, 11),
    //stop: new Date("2016-09-22"),
    order: Order.asc,
    // limit:10000
  }

  constructor(private changeDetectorRef: ChangeDetectorRef, private log: Logger, private sensorsSharedService: SensorsSharedService) {

    // sensorsSharedService.getStatisticsData().subscribe((sensor: Sensor) => {
    //   // provedu aktualizaci puvodniho sensoru na novy ktery obsahuje vsechny payloady
    //   // - nutne jelikoz se tyto hodnoty mohou dal pouzivat
    //   ArrayUtils.replaceObject(this.sensorsAnimate, sensor, (sen) => { return sen.devEUI === sensor.devEUI })
    // })

    this.sensorsSharedService.listenEventData(Events.loadSensor).filter((sensor) => { return sensor != undefined })
      .subscribe((sensorStatistics: SensorStatistics) => {
        ArrayUtils.replaceOrAddObject(this.sensors, sensorStatistics, (sen) => { return sen.devEUI === sensorStatistics.devEUI })
        // this.selectedSensor = null;
        this.changeDetectorRef.detectChanges();
      })

    // zvyrazneni vybraneho
    this.sensorsSharedService.listenEventData(Events.selectSensor).subscribe((sensorStatistics: SensorStatistics) => {
      this.selectedSensor = sensorStatistics;
      this.changeDetectorRef.detectChanges();
    });

  }

  private isSensorOnMap(sensor: SensorStatistics): boolean {
    // return sensor.showData;
    return false;
  }


  private isSensorSelected(sensor: SensorStatistics): boolean {
    if (this.selectedSensor != undefined) {
      if (sensor.devEUI === this.selectedSensor.devEUI) {
        return true;
      }
    }
    return false;
  }

  private onClickAnim(sensor: SensorStatistics) {
    // this.sensorsSharedService.setAnimationSensor(sensor);
    // this.sensorsSharedService.publishEvent(Events.runAnimation, sensor, "MenuComponent.onClickAnim");
  }

  private onClick(sensor: SensorStatistics) {
    this.selectedSensor = sensor;
    this.sensorsSharedService.publishEvent(Events.selectSensor, sensor, "MenuComponent.onClick")
    this.devicedetailParamsDefault.devEUI = sensor.devEUI;
    // this.devicedetailParamsDefault.payloadType = sensor.payloadType;
    // this.devicedetailParamsDefault.publisher = "menuItem"
    this.sensorsSharedService.loadStatisticsData(this.devicedetailParamsDefault);
  }
}