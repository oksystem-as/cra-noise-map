import { Component, AfterViewInit, ViewChild, SimpleChange, Input, ChangeDetectorRef, } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService, Events } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { ObjectUtils, ArrayUtils } from '../../utils/utils';

import { ARF8084BAPayload } from '../../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../../payloads/RHF1S001Payload';
import { CRaService, DeviceDetailParams, Order } from '../../service/cra.service';
import { Observable } from 'rxjs/Observable';
import { GroupedObservable } from 'rxjs/operator/groupBy';
import { BehaviorSubject } from "rxjs/Rx";
import 'rxjs/Rx';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';
import { StatisticsUtils, StatisType, SensorStatistics, Statistics } from '../../utils/statis-utils';

@Component({
    selector: 'statistics',
    templateUrl: 'app/components/statistics/statistics.component.html',
    styleUrls: ['app/components/statistics/statistics.component.css'],
})
export class StatisticsComponent {
    //collapse content
    private isHidden: boolean = true;
    private selectedSensor: SensorStatistics;

    @ViewChild('lgModal')
    private lgModal: ModalDirective;

    getTooltip() {
        if (this.isHidden) {
            return "Zobrazit statistiky"
        }
        return "Sbalit statistiky"
    }

    constructor(private changeDetectorRef: ChangeDetectorRef, private log: Logger, private sensorsSharedService: SensorsSharedService) {

        // zvyrazneni vybraneho
        this.sensorsSharedService.listenEventData(Events.selectSensor).subscribe((selectedSensor: SensorStatistics) => {
            this.selectedSensor = selectedSensor;
            this.isHidden = false;
            changeDetectorRef.detectChanges();
            if (this.lgModal) {
                this.lgModal.show();
            }
        });
    }

    onOpen() {
        this.sensorsSharedService.publishEvent(Events.refreshStatisSlider, undefined, "StatisticsComponent.onOpen");
        this.sensorsSharedService.publishEvent(Events.statisticsDialog, "dialogIsOpened", "StatisticsComponent.onOpen" )
    }

    getSensorName():string {
        if (this.selectedSensor){
            return this.selectedSensor.name;
        }
        return ""
    }

}