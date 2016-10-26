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
    public statisId = "statis" + RandomUtils.getRandom();
    public sliderId = "slider" + RandomUtils.getRandom();

    private devEUI;
    private slider;
    private firstInitSlider = true;
    private sliderEvent: BehaviorSubject<any> = new BehaviorSubject(null);

    @Input()
    public statisType: StatisType = StatisType.MONTH;


    public refreshSlider(data) {
        console.log(' [refreshSlider]: ', this.slider, data);
        // hotfix - nevim uplne proc, ale funguje to ...
        setTimeout(() => {
            if (this.slider) {
                this.slider.relayout();
            }
        }, 1)
    }

    private removeSlider() {
        if (this.slider) {
            this.slider.destroy();
            this.sliderEvent.complete();
            this.sliderEvent = new BehaviorSubject(null);
        }
    }

    // ngOnChanges(data) {
    //     console.log("StatisComponent.ngOnChanges", data);
    // }

   

    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService, elementRef: ElementRef) {
    }

    private initSlider(firstDate: Date) {
        this.sensorsSharedService.publishEvent(Events.sliderNewDate, firstDate);
        // this.removeSlider();
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

        this.log.debug("init slider - ", this.statisType)
        // let elem = this.elementRef.nativeElement.shadowRoot.querySelector('#' + this.statisId);
        this.slider = new Slider('#' + this.statisId, {
            ticks: ticks,
            ticks_labels: ticks_labels,
            ticks_snap_bounds: diff / 24,
            value: [ticks[0], ticks[countOfpoint]],
            // definice zobrazeni datoveho modelu uzivateli v tooltipu 
            formatter: function (value) {
                // console.log(value)
                return new Date(value[0]).toLocaleString() + " : " + new Date(value[1]).toLocaleString();
            },
            id: this.sliderId,
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
                        devEUI: this.devEUI,
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
  
    private getDateFormatForTable(date: Date): string {
        let dateFormat = date.toLocaleDateString();
        switch (this.statisType) {
            case StatisType.HOUR: {
                dateFormat = date.toLocaleString();
                break;
            }
        }
        return dateFormat;
    }


    // ngOnInit() {
    //     console.log(' [ngOnInit]: ', this.statisType);
    // }

    ngAfterViewInit(): void {
        // console.log(' [ngAfterViewInit]: ', this.statisType);
        // default
        let start = new Date().getTime() - DateUtils.DAY_IN_MILIS;
        let start2 = new Date().getTime();
        this.slider = new Slider('#' + this.statisId, {
            ticks: [start, start2],
            ticks_labels: [new Date(start).toLocaleDateString(), new Date(start2).toLocaleDateString()],
            ticks_snap_bounds: 2,
            formatter: function (value) {
                // console.log(value)
                return new Date(value).toLocaleString();
            },
            id: this.sliderId,
        });
        this.slider.disable();
    }
}