import { Component, AfterViewInit, ViewChild, SimpleChange, Input } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService } from '../sensors-shared.service';
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

export enum StatisType {
    HOUR,
    DAY6_22,
    DAY18_22,
    NIGHT22_6,
    DAY24,
    WEEK,
    MONTH,
}

@Component({
    selector: 'statistics',
    templateUrl: 'app/components/statistics/statistics.component.html',
    styleUrls: ['app/components/statistics/statistics.component.css'],
})
export class StatisticsComponent  {
}