import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { MapComponent } from './../map.component';
import { SensorsSharedService, Overlay, OverlayGroup, Events } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { ObjectUtils, ArrayUtils } from '../../utils/utils';
import { CRaService, DeviceDetailParams, Order } from '../../service/cra.service';
import { StatisticsUtils, Statistics, Statistic, SensorStatistics } from '../../utils/statis-utils';

@Component({
  selector: 'senzor-menu',
  templateUrl: './senzor.menu.component.html',
  styleUrls: ['./senzor.menu.component.css'],
})

export class SenzorMenuComponent {
  @Input()
  private showInStatisticsMenu: boolean = false;

  private sensors: SensorStatistics[] = [];
  private selectedSensor: SensorStatistics;
  private init = true;

  constructor(private changeDetectorRef: ChangeDetectorRef, private log: Logger, private sensorsSharedService: SensorsSharedService) {

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

  private onClick(sensor: SensorStatistics) {
    this.selectedSensor = sensor;
    this.sensorsSharedService.publishEvent(Events.selectSensor, sensor, "MenuComponent.onClick")
    this.sensorsSharedService.loadStatisticsData(<DeviceDetailParams>{devEUI: sensor.devEUI});
  }
}