import { Component, AfterViewInit, ViewChild, SimpleChange, Input, ViewEncapsulation, ElementRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService, Events } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { ObjectUtils, RandomUtils, DateUtils } from '../../utils/utils';
import { StatisType } from '../../utils/statis-utils';

import { ARF8084BAPayload } from '../../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../../payloads/RHF1S001Payload';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../../service/cra.service';
import { Observable } from 'rxjs/Observable';
import { GroupedObservable } from 'rxjs/operator/groupBy';
import { BehaviorSubject } from "rxjs/Rx";
import 'rxjs/Rx';
import { ChartsModule } from 'ng2-charts/ng2-charts';

@Component({
    selector: 'statis',
    templateUrl: 'app/components/statistics/statis.component.html',
    styleUrls: ['app/components/statistics/statis.component.css'],
    // encapsulation: ViewEncapsulation.Native
})
export class StatisComponent implements AfterViewInit {

    @Input()
    public statisType: StatisType = StatisType.DAY24;

    public statisType2: StatisType = StatisType.DAY6_22;

    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService, elementRef: ElementRef) {  }


    ngAfterViewInit(): void {
        // console.log(' [ngAfterViewInit]: ', this.statisType);
        // default
        // let start = new Date().getTime() - DateUtils.DAY_IN_MILIS;
        // let start2 = new Date().getTime();
        // this.slider = new Slider('#' + this.statisId, {
        //     ticks: [start, start2],
        //     ticks_labels: [new Date(start).toLocaleDateString(), new Date(start2).toLocaleDateString()],
        //     ticks_snap_bounds: 2,
        //     formatter: function (value) {
        //         // console.log(value)
        //         return new Date(value).toLocaleString();
        //     },
        //     id: this.sliderId,
        // });
        // this.slider.disable();
    }
}