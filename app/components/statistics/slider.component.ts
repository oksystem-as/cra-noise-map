import { Component, SimpleChanges, OnChanges, AfterViewInit, ChangeDetectorRef, ViewChild, SimpleChange, Input, ViewEncapsulation, ElementRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService, Events } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { ObjectUtils, RandomUtils, DateUtils } from '../../utils/utils';
import { StatisticsUtils, StatisType } from '../../utils/statis-utils';

import { ARF8084BAPayload } from '../../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../../payloads/RHF1S001Payload';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../../service/cra.service';
import { Observable } from 'rxjs/Observable';
import { GroupedObservable } from 'rxjs/operator/groupBy';
import { BehaviorSubject } from "rxjs/Rx";
import 'rxjs/Rx';
import { ChartsModule } from 'ng2-charts/ng2-charts';

@Component({
    moduleId: module.id,
    selector: 'slider-statis',
    templateUrl: 'slider.component.html',
    styleUrls: ['slider.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class SliderStatisComponent { // implements OnChanges {
    public sliderId = "sliderId" + RandomUtils.getRandom();
    public sliderIdInternal = "statisSliderId" + RandomUtils.getRandom();
    private slider;
    private firstInitSlider = true;
    private sliderEvent: BehaviorSubject<any> = new BehaviorSubject(null);

    constructor( private log: Logger, private sensorsSharedService: SensorsSharedService, elementRef: ElementRef) {
        // changeDetectorRef.detach(); private changeDetectorRef: ChangeDetectorRef,
        var source = sensorsSharedService.listenEventData(Events.statistics)
            .subscribe(sensorStatistics => {
                // this.clearChartAndTable();
                // console.log(statistics)
                sensorStatistics.statistics.forEach(statis => {
                    if (statis.type == StatisType.HOUR) {
                        let minDate = new Date().getTime();
                        statis.avgValues.forEach(value => {
                            if (value.date.getTime() < minDate) {
                                minDate = value.date.getTime()
                            }
                        })
                        this.initSlider(new Date(minDate));
                        this.refreshSlider();
                    }
                });
                // this.sensorsSharedService.publishEvent(Events.showMasterLoading, false);
            });
    }

    // ngOnChanges(changes: SimpleChanges) {
    //     console.log("ngOnChanges ", changes);
    //     this.refreshSlider();
    //     // this.changeDetectorRef.detectChanges();
    // }

    ngAfterViewInit(): void {
        // this.initSlider(new Date(2016, 1.1));
        // this.refreshSlider();
    }

    private removeSlider() {
        if (this.slider) {
            this.slider.destroy();
            this.sliderEvent.complete();
            this.sliderEvent = new BehaviorSubject(null);
        }
    }

    public refreshSlider() {
        // hotfix - nevim uplne proc, ale funguje to ...
        setTimeout(() => {
            if (this.slider) {
                this.slider.relayout();
            }
        }, 1)
    }

    private initSlider(firstDate: Date) {
        // this.sensorsSharedService.publishEvent(Events.sliderNewDate, firstDate);
        this.removeSlider();
        let oldDate = firstDate;

        // console.log("start ", firstDate);

        // pocet bodu na slideru    
        let countOfpoint = 3;
        let aktualDate = new Date();

        // rozdil mezi kazdym bodem
        let diff = (aktualDate.getTime() - oldDate.getTime()) / countOfpoint;
        // console.log(diff);

        let ticks_labels = [];
        let ticks = [];

        // definice prvniho bodu
        ticks.push(oldDate.getTime());
        ticks_labels.push(oldDate.toLocaleDateString());

        let pom;
        for (var index = 1; index < countOfpoint; index++) {
            let time = oldDate.getTime() + index * diff;
            pom = new Date(time);
            // console.log(time, pom);
            // dalsi body
            ticks.push(pom.getTime());
            ticks_labels.push(pom.toLocaleDateString());
        }

        // definice posledniho bodu
        ticks.push(aktualDate.getTime());
        ticks_labels.push(aktualDate.toLocaleDateString());

        // console.log(ticks);
        // console.log(ticks_labels);
        // let elem = this.elementRef.nativeElement.shadowRoot.querySelector('#' + this.statisId);
        this.slider = new Slider('#' + this.sliderId, {
            ticks: ticks,
            ticks_labels: ticks_labels,
            ticks_snap_bounds: diff / 24,
            value: [ticks[0], ticks[countOfpoint]],
            // definice zobrazeni datoveho modelu uzivateli v tooltipu 
            formatter: function (value) {
                // console.log(value)
                return new Date(value[0]).toLocaleDateString() + " : " + new Date(value[1]).toLocaleDateString();
            },
            id: this.sliderIdInternal,
        });

        this.sliderEvent.asObservable()
            .filter(data => { return data != undefined; })
            .debounceTime(1500)
            .subscribe(newDate => {
                //this.sliderEvent.next(newDate);
                let time1 = parseInt(newDate[0].toString());
                let time2 = parseInt(newDate[1].toString());
                // this.selectedDate = this.slider.getValue();
                this.log.debug("slideStop - " + newDate)

                if (newDate != undefined) {
                    let devicedetailParams = <DeviceDetailParams>{
                        start: new Date(time1),
                        stop: new Date(time2),
                        // devEUI: this.devEUI,
                        //limit: 5,
                        payloadType: PayloadType.ARF8084BA,
                        order: Order.asc,
                        publisher: this.sliderId,
                    }

                    this.sensorsSharedService.loadStatisticsData(devicedetailParams);
                }
            });

        // pokud se vybere nove datum provede se prenacteni dat s novym vychozim datem
        this.slider.on("slideStop", newDate => {
            // z duvoudu moznosti pouziti debounceTime
            this.sliderEvent.next(newDate);
        });

    }
}