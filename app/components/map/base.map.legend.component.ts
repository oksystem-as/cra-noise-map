import { Component, AfterViewInit, ViewChild, SimpleChange, Input, ViewEncapsulation, ElementRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { ObjectUtils, RandomUtils, ColorUtils, ColorLegend } from '../../utils/utils';

import { ARF8084BAPayload } from '../../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../../payloads/RHF1S001Payload';
import { CRaService, DeviceDetailParams, Order } from '../../service/cra.service';
import { Observable } from 'rxjs/Observable';
import { GroupedObservable } from 'rxjs/operator/groupBy';
import { BehaviorSubject } from "rxjs/Rx";
import 'rxjs/Rx';
import { ChartsModule } from 'ng2-charts/ng2-charts';

@Component({
    selector: 'base-map-legend',
    templateUrl: 'app/components/map/base.map.legend.component.html',
    styleUrls: ['app/components/map/base.map.legend.component.css']
})
export class BaseMapLegendComponent {
    private legends: ColorLegend[] = ColorUtils.colorValueMap;
    //collapse content
    private isHidden: boolean = true;
    
    @Input()
    private showVertical: boolean = true;

    constructor (private log: Logger, private sensorsSharedService: SensorsSharedService) {
      this.isHidden = true;
    }
}