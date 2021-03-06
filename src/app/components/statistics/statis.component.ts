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
import { CRaService, DeviceDetailParams, Order } from '../../service/cra.service';
import { Observable } from 'rxjs/Observable';
import { GroupedObservable } from 'rxjs/operator/groupBy';
import { BehaviorSubject } from "rxjs/Rx";
import 'rxjs/Rx';
import { SliderStatisComponent } from './slider.component';
import { ChartComponent } from './chart.component';


@Component({
    selector: 'statis',
    templateUrl: './statis.component.html',
    styleUrls: ['./statis.component.css'],
    // encapsulation: ViewEncapsulation.Native
})
export class StatisComponent { //implements AfterViewInit {

    // @ViewChild(SliderStatisComponent)
    // private sliderStatisComponent: SliderStatisComponent;

    @Input()
    statisType: string;

    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService, elementRef: ElementRef) { }
}