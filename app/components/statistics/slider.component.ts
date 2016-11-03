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
export class SliderStatisComponent {
    public sliderId = "sliderId" + RandomUtils.getRandom();
    public sliderIdInternal = "statisSliderId" + RandomUtils.getRandom();
    private slider;
    private firstInitSlider = true;
    private sliderEvent: BehaviorSubject<any> = new BehaviorSubject(null);

    @Input()
    public statisType: StatisType = StatisType.DAY24;

    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService, elementRef: ElementRef) {
        
         sensorsSharedService.listenEventData(Events.statisSlider).subscribe(data => {
            if (data.statisType !== this.statisType) { // pozadavek na globallni nastaveni
                this.slider.setValue([data.startDate.getTime(), data.endDate.getTime()]);
            }
        })

        sensorsSharedService.listenEventData(Events.refreshStatisSlider).subscribe((statisType: StatisType) => {
            if (this.statisType === statisType || statisType === undefined) {
                this.refreshSlider();
            }
        });

        sensorsSharedService.listenEventData(Events.statistics)
            .subscribe(sensorStatistics => {
                sensorStatistics.statistics.forEach(statis => {
                    // kazda instance dostane stejny list a berem jen hranice z HOUR statistik  
                    if (statis.type == StatisType.HOUR) {
                        let minDate = new Date().getTime();
                        let maxDate = new Date(1970, 1, 1).getTime();
                        statis.avgValues.forEach(value => {
                            if (value.date.getTime() < minDate) {
                                minDate = value.date.getTime()
                            }

                            if (value.date.getTime() > maxDate) {
                                maxDate = value.date.getTime()
                            }
                        })
                        this.initSlider(new Date(minDate), new Date(maxDate));
                        this.refreshSlider();
                    }
                });
            });
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

    private initSlider(firstDate: Date, endDate: Date) {

        this.removeSlider();
        let oldDate = firstDate;

        // console.log("start ", firstDate);

        // pocet bodu na slideru    
        let countOfpoint = 3;
        let aktualDate = endDate;

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
            // dalsi body
            ticks.push(pom.getTime());
            ticks_labels.push(pom.toLocaleDateString());
        }

        // definice posledniho bodu
        ticks.push(aktualDate.getTime());
        ticks_labels.push(aktualDate.toLocaleDateString());

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
            // .debounceTime(1000)
            .subscribe(newDate => {

                let time1 = parseInt(newDate[0].toString());
                let time2 = parseInt(newDate[1].toString());

                if (newDate != undefined) {
                    this.sensorsSharedService.publishEvent(
                        Events.statisSlider,
                        { statisType: this.statisType, startDate: new Date(time1), endDate: new Date(time2) },
                        "SliderStatisComponent.slideStop");
                }
            });

        this.refreshSlider();

        // pokud se vybere nove datum provede se prenacteni dat s novym vychozim datem
        this.slider.on("slideStop", newDate => {
            // z duvoudu moznosti pouziti debounceTime
            this.sliderEvent.next(newDate);
        });

    }
}