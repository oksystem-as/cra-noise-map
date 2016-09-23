import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService } from './sensors-shared.service';
import { Sensor } from '../entity/sensor';
import { Payload, PayloadType } from '../payloads/payload';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../service/cra.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/Rx";
import 'rxjs/Rx';


@Component({
    selector: 'statistics',
    templateUrl: 'app/components/statistics.component.html',
    styleUrls: ['app/components/statistics.component.css'],
})
export class StatisticsComponent implements AfterViewInit {
    private dayStatis;

    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
        sensorsSharedService.getStatisticsData().subscribe((sensor: Sensor) => {
            // do statisc sensors
            if (sensor != undefined && sensor.devEUI != undefined) {
                this.dayStatis = sensor.devEUI;
                this.log.debug("statis ", this.dayStatis);
            }

        })
    }

    ngAfterViewInit(): void {
    }
}