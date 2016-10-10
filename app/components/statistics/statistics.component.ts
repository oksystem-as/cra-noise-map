import { Component, AfterViewInit, ViewChild, SimpleChange, Input } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService, Events } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { RxUtils, ObjectUtils } from '../../utils/utils';

import { ARF8084BAPayload } from '../../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../../payloads/RHF1S001Payload';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../../service/cra.service';
import { Observable } from 'rxjs/Observable';
import { GroupedObservable } from 'rxjs/operator/groupBy';
import { BehaviorSubject } from "rxjs/Rx";
import 'rxjs/Rx';
import { ChartsModule, BaseChartComponent } from 'ng2-charts/ng2-charts';

@Component({
    selector: 'statistics',
    templateUrl: 'app/components/statistics/statistics.component.html',
    styleUrls: ['app/components/statistics/statistics.component.css'],
})
export class StatisticsComponent {
    //collapse content
    public isHidden: boolean = false;

    private sensors: Sensor[] = [];
    // private sensorsAnimate: Sensor[] = [];
    private selectedSensor: Sensor;

    private init = true;
    // private sliderNewDate = SensorsSharedService.minDateLimit;

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
            .filter((sensors) => { return sensors != undefined && sensors.length > 0; })
            .subscribe((sensors: Sensor[]) => {
                this.sensors = sensors;
                this.selectedSensor = null;
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