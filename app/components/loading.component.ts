import { DateUtils } from '../utils/utils';
import { Component, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService, Events } from './sensors-shared.service';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../service/cra.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/Rx";
import 'rxjs/Rx';


@Component({
    moduleId: module.id,
    selector: 'loading',
    templateUrl: 'loading.component.html',
    styleUrls: ['loading.component.css'],
    // encapsulation: ViewEncapsulation.None
})
export class LoadingComponent implements AfterViewInit {
   
    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
    }

    ngAfterViewInit(): void {
    }
}