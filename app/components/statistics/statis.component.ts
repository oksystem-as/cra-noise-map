import { Component, AfterViewInit, ViewChild, SimpleChange, Input, ViewEncapsulation, ElementRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { RxUtils, ObjectUtils, RandomUtils } from '../../utils/utils';

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
    selector: 'statis',
    templateUrl: 'app/components/statistics/statis.component.html',
    styleUrls: ['app/components/statistics/statis.component.css'],
    // encapsulation: ViewEncapsulation.Native
})
export class StatisComponent implements AfterViewInit {
    @ViewChild('myChart')
    private _chart;

    public statisId = "statis" + RandomUtils.getRandom();

    private devEUI;
    private slider;
    private firstInitSlider = true;
    private sliderEvent: BehaviorSubject<any> = new BehaviorSubject(null);

    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true
    };

    public barChartLabels: string[] = [];
    public barChartType: string = 'line';
    public barChartLegend: boolean = false;
    public barChartData: any[] = [];
    // private elementRef;

    @Input()
    public statisType: StatisType = StatisType.MONTH;

    private removeSlider() {
        if (this.slider) {
            this.slider.destroy();
        }
    }

    private updateChart(data: number, label: string) {
        console.log(' [updateChart]: ', data, label);
        this.barChartData.push(data);
        this.barChartLabels.push(label);
        let sch = new SimpleChange(this.barChartData, this.barChartData);
        let obj = { data: sch };
        if(this._chart != undefined && this._chart.chart != undefined){
            this._chart.ngOnChanges(obj);
        }
    }

    private clearChart() {
        console.log(' [clearChart]: ', this.statisType);
        this.barChartData.length = 0;
        this.barChartLabels.length = 0;
        let sch = new SimpleChange(this.barChartData, this.barChartData);
        let obj = { data: sch };
        if(this._chart != undefined && this._chart.chart != undefined){
            this._chart.ngOnChanges(obj);
        }
    }

    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService, elementRef: ElementRef) {
            // this.elementRef = elementRef;
    
        var source = sensorsSharedService.getStatisticsData()
            .filter(data => {
                return data != undefined && data.payloads != undefined && data.payloadType == PayloadType.ARF8084BA
            }).subscribe(data => {
                this.clearChart();
                
                if (this.firstInitSlider) {
                    this.initSlider(data.payloads[0].createdAt);
                    this.firstInitSlider = false;
                }

                this.devEUI = data.devEUI;
                // 1. vytvarim novy stream jelikoz stream getStatisticsData() se neuzavira a nektere volani 
                // (reduce(), last() atp.) cekaji na completed resp uzavreni streamu, ktereho se nedockaji ...
                // 2. musim provest deep copy listu a v nem obs. objektu jinak dochayi k modifikaci objektu napric streamy 
                switch (this.statisType) {
                    case StatisType.HOUR: {
                        log.debug('hodinovy prumer: ');
                        Observable.from(ObjectUtils.deepCopyArr(data.payloads)).first().subscribe((data) => {
                            console.log("first", data);
                        });
                        this.resolveLogAvaerange(RxUtils.groupByHours(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    case StatisType.DAY6_22: {
                        log.debug('denni 6-22 prumer: ');
                        this.resolveLogAvaerange(RxUtils.groupByDay(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    case StatisType.DAY18_22: {
                        log.debug('denni 18-22 prumer: ');
                        this.resolveLogAvaerange(RxUtils.groupBy18_22(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    case StatisType.NIGHT22_6: {
                        log.debug('nocni 22-6 prumer: ');
                        this.resolveLogAvaerange(RxUtils.groupByNight(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    case StatisType.DAY24: {
                        log.debug('denni 24h prumer: ');
                        this.resolveLogAvaerange(RxUtils.groupByDays(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    case StatisType.WEEK: {
                        log.debug('tydeni prumer: ');
                        this.resolveLogAvaerange(RxUtils.groupByWeek(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    case StatisType.MONTH: {
                        log.debug('mesicni prumer: ');
                        this.resolveLogAvaerange(RxUtils.groupByMonth(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    default: throw "nepodporovany graf " + this.statisType;
                }
            });
    }

    private initSlider(firstDate: Date) {
        // this.removeSlider();
        let oldDate = firstDate;

        // pocet bodu na slideru    
        let countOfpoint = 3;
        let aktualDate = new Date();

        // rozdil mezi kazdym bodem
        let diff = (aktualDate.getTime() - oldDate.getTime()) / countOfpoint;

        this.log.debug(diff);

        let ticks_labels = []; 
        let ticks = [];

        // definice prvniho bodu
        ticks.push(oldDate.getTime());
        ticks_labels.push(oldDate.toLocaleDateString());

        let pom;
        for (var index = 1; index < countOfpoint; index++) {
            pom = new Date(oldDate.getTime() + index * diff);
            // dalsi body
            ticks.push(pom.getTime());
            ticks_labels.push(pom.toLocaleDateString());
        }

        // definice posledniho bodu
        ticks.push(aktualDate.getTime());
        ticks_labels.push(aktualDate.toLocaleDateString());

        this.log.debug(ticks);
        this.log.debug(ticks_labels);
        
        this.log.debug("init slider - ", this.statisType )
        // let elem = this.elementRef.nativeElement.shadowRoot.querySelector('#' + this.statisId);
        let slider = new Slider('#' + this.statisId, {
            ticks: ticks,
            ticks_labels: ticks_labels,
            ticks_snap_bounds: diff / 24,
            value: [ticks[0], ticks[countOfpoint]],
            // definice zobrazeni datoveho modelu uzivateli v tooltipu 
            formatter: function (value) {
                // console.log(value)
                return new Date(value[0]).toLocaleString() + " : " + new Date(value[1]).toLocaleString();
            },
            id: "slider3"
        });

        this.sliderEvent.asObservable()
            .filter(data => { return data != undefined; })
            .debounceTime(1500)
            .subscribe(newDate => {
                this.sliderEvent.next(newDate);
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
                        order: Order.asc
                    }

                    this.sensorsSharedService.loadStatisticsData(devicedetailParams);
            }});

        // pokud se vybere nove datum provede se prenacteni dat s novym vychozim datem
        slider.on("slideStop", newDate => {
            // z duvoudu moznosti pouziti debounceTime
            this.sliderEvent.next(newDate);
        });

    }
    private resolveLogAvaerange(group: Observable<GroupedObservable<number, Payload>>) {
        group.subscribe(group => {
            // console.log('group: ', group);

            // uprava value a pridani count
            let powDataStream = group.map((data, idx) => {
                let powValue = Math.pow(10, (this.getValue(data) / 10))
                let powObj = { count: idx + 1, time: data.createdAt, powValue: powValue, sumValue: powValue };
                return powObj;
            });

            // // soucet value
            let sumDataStream = powDataStream.reduce((a, b) => {
                b.sumValue = b.powValue + a.sumValue;
                return b;
            });

            // logaritm. prumer ze souctu a poctu polozek (jen pro danou hodinu)
            let logAvgDataStream = sumDataStream.map((data, idx) => {
                // console.log(' [datax]: ', data);
                let avgObj = { time: data.time, logAverange: 10 * Math.log(data.sumValue / data.count) / Math.log(10) };
                return avgObj;
            })

            // (data, idx) => {
            //     console.log("flatMap", data.payloads);
            //     return data.payloads;
            // })


            // let concatDataStream = logAvgDataStream.concatMap((data, idx) => {
            //     console.log(data);
            //     let all = []
            // 	return Observable
            // .interval(100)
            // .take(x).map(function() { return i; });
            // });

            // // zobrazeni a spusteni straemu
            logAvgDataStream.subscribe(
                data => {
                    let dateFormat;
                    switch (this.statisType) {
                        case StatisType.HOUR: {
                            dateFormat = data.time.toLocaleString();
                            break;
                        }
                        case StatisType.DAY6_22:
                        case StatisType.DAY18_22:
                        case StatisType.NIGHT22_6:
                        case StatisType.DAY24:
                        case StatisType.WEEK: {
                            dateFormat = data.time.toLocaleDateString();
                            break;
                        }
                        case StatisType.MONTH: {
                            // TODO jen mesice 
                            dateFormat = data.time.toLocaleDateString();
                            break;
                        }
                        default: throw "nepodporovany graf " + this.statisType;
                    }
                    this.updateChart(Math.round(data.logAverange), dateFormat);
                    //    console.log(' [data]: ', data.time.toLocaleString(), ' logAverange: ' + data.logAverange); 
                },

                (err) => { console.log('Error: ' + err); },
                () => { /*console.log('Completed')*/ });
        });
    }

    private getValue(payload: Payload): number {
        if (payload.payloadType == PayloadType.ARF8084BA) {
            return (payload as ARF8084BAPayload).temp;
        }
        if (payload.payloadType == PayloadType.RHF1S001) {
            return (payload as RHF1S001Payload).teplota;
        }

    }

    // @Input() addItemStream:Observable<any>;
    // counter = 0;

    ngOnInit() {
        console.log(' [ngOnInit]: ', this.statisType);
    }

    ngAfterViewInit(): void {
        console.log(' [ngAfterViewInit]: ', this.statisType);
    }
}


  //     var ctx = document.getElementById("myChart").getContext("2d");
        // var data = {
        //     labels: ["IBM", "Microsoft"],
        //     datasets: [{
        //         label: "Product A",
        //         fillColor: "rgba(220,220,220,0.5)",
        //         strokeColor: "rgba(220,220,220,0.8)",

        //         data: [25, 75]
        //     }, {
        //         label: "Product B",
        //         fillColor: "rgba(151,187,205,0.5)",
        //         strokeColor: "rgba(151,187,205,0.8)",

        //         data: [75, 25]
        //     }]

        // }
        // var myBarChart = new Chart(ctx).Bar(data);
        // setTimeout(function(){
        //   myBarChart.addData([40, 60], "Google");
        // },1000);