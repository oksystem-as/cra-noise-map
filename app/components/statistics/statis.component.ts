import { Component, AfterViewInit, ViewChild, SimpleChange, Input, ViewEncapsulation, ElementRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService, Events } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { ObjectUtils, RandomUtils, DateUtils } from '../../utils/utils';

import { ARF8084BAPayload } from '../../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../../payloads/RHF1S001Payload';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../../service/cra.service';
import { Observable } from 'rxjs/Observable';
import { GroupedObservable } from 'rxjs/operator/groupBy';
import { BehaviorSubject } from "rxjs/Rx";
import 'rxjs/Rx';
import { ChartsModule } from 'ng2-charts/ng2-charts';

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
    @ViewChild('myTable')
    private _table;

    public statisId = "statis" + RandomUtils.getRandom();
    public sliderId = "slider" + RandomUtils.getRandom();

    private devEUI;
    private slider;
    private firstInitSlider = true;
    private sliderEvent: BehaviorSubject<any> = new BehaviorSubject(null);

    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true,
        maintainAspectRatio: false,
    };

    public barChartLabels: string[] = [];
    public barTableLabels: string[] = [];
    public barChartType: string = 'line';
    public colors: any[] = [];
    public barChartLegend: boolean = false;

    public barChartData = [{
        label: "hluk(dB)",
        borderWidth: 1,
        // data: [],
        data: [],
        // colors: []


        // fill: false,
        // lineTension: 0.1,
        // backgroundColor: "rgba(75,192,192,0.4)",
        // borderColor: "rgba(75,192,192,1)",
        // borderCapStyle: 'butt',
        // borderDash: [],
        // borderDashOffset: 0.0,
        // borderJoinStyle: 'miter',
        // pointBorderColor: "rgba(75,192,192,1)",
        // pointBackgroundColor: "#fff",
        // pointBorderWidth: 1,
        // pointHoverRadius: 5,
        // pointHoverBackgroundColor: "rgba(75,192,192,1)",
        // pointHoverBorderColor: "rgba(220,220,220,1)",
        // pointHoverBorderWidth: 2,
        // pointRadius: 1,
        // pointHitRadius: 10,
        // spanGaps: false,

    }
        // , 
        // {
        //     label: "hlukx(dB)",
        //     borderWidth: 1,
        //     // data: [],
        //     data: [],
        //     // fill: false,
        //     // lineTension: 0.1,
        //     backgroundColor: "rgba(75,192,192,0.4)",
        //     borderColor: "rgba(75,192,192,1)",
        //     // borderCapStyle: 'butt',
        //     // borderDash: [],
        //     // borderDashOffset: 0.0,
        //     // borderJoinStyle: 'miter',
        //     // pointBorderColor: "rgba(75,192,192,1)",
        //     // pointBackgroundColor: "#fff",
        //     // pointBorderWidth: 1,
        //     // pointHoverRadius: 5,
        //     // pointHoverBackgroundColor: "rgba(75,192,192,1)",
        //     // pointHoverBorderColor: "rgba(220,220,220,1)",
        //     // pointHoverBorderWidth: 2,
        //     // pointRadius: 1,
        //     // pointHitRadius: 10,
        //     // spanGaps: false,

        // }
    ];

    // private elementRef;

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

    private updateChartAndTable(data: number, date: Date) {
        // console.log(' [updateChart]: ', data, label);
        this.barChartData[0].data.push(data);
        if (data > 83) {
            this.colors.push("#fff");
        } else {
            this.colors.push("#aaa");
        }

        this.barChartLabels.push(this.getDateFormat(date));
        this.barTableLabels.push(this.getDateFormatForTable(date));
        let sch = new SimpleChange(this.barChartData, this.barChartData);
        let obj = { data: sch };

        if (this._chart != undefined && this._chart.chart != undefined) {
            this._chart.ngOnChanges(obj);
        }

        if (this._table != undefined) {
            this._table.refresh();
        }
    }

    private clearChartAndTable() {
        // console.log(' [clearChart]: ', this.statisType);
        this.barChartData[0].data.length = 0;
        this.colors.length = 0;
        this.barChartLabels.length = 0;
        this.barTableLabels.length = 0;
        let sch = new SimpleChange(this.barChartData, this.barChartData);
        let obj = { data: sch };

        if (this._chart != undefined && this._chart.chart != undefined) {
            this._chart.ngOnChanges(obj);
        }

        if (this._table != undefined) {
            this._table.refresh();
        }
    }

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
    private resolveLogAverange(group: Observable<GroupedObservable<number, Payload>>) {
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

            // // zobrazeni a spusteni straemu
            logAvgDataStream.subscribe(
                data => {
                    this.updateChartAndTable(Math.round(data.logAverange), data.time);
                    // console.log(' [data]: ', data.time.toLocaleString(), ' logAverange: ' + data.logAverange); 
                },

                (err) => { console.log('Error: ' + err); },
                () => { /*console.log('Completed')*/ });
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

    private getDateFormat(date): string {
        let dateFormat;
        switch (this.statisType) {
            case StatisType.HOUR:
            case StatisType.DAY6_22:
            case StatisType.DAY18_22:
            case StatisType.NIGHT22_6:
            case StatisType.DAY24:
            case StatisType.WEEK: {
                dateFormat = date.toLocaleDateString();
                break;
            }
            case StatisType.MONTH: {
                // TODO jen mesice 
                dateFormat = date.toLocaleDateString();
                break;
            }
            default: throw "nepodporovany graf " + this.statisType;
        }
        return dateFormat
    }

    private getValue(payload: Payload): number {
        if (payload.payloadType == PayloadType.ARF8084BA) {
            return (payload as ARF8084BAPayload).temp;
        }
        if (payload.payloadType == PayloadType.RHF1S001) {
            return (payload as RHF1S001Payload).teplota;
        }

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

        // var lineData: LinearChartData = {
        //     labels: ['03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00'],
        //     datasets: [
        //         {
        //             label: 'Accepted',
        //             fillColor: 'rgba(220,220,220,0.2)',
        //             strokeColor: 'rgba(220,220,220,1)',
        //             pointColor: 'rgba(220,220,220,1)',
        //             pointStrokeColor: '#fff',
        //             pointHighlightFill: '#fff',
        //             pointHighlightStroke: 'rgba(220,220,220,1)',
        //             data: [65, 59, 80, 81, 56, 55, 40]
        //         },
        //         {
        //             label: 'Quarantined',
        //             fillColor: 'rgba(151,187,205,0.2)',
        //             strokeColor: 'rgba(151,187,205,1)',
        //             pointColor: 'rgba(151,187,205,1)',
        //             pointStrokeColor: '#fff',
        //             pointHighlightFill: '#fff',
        //             pointHighlightStroke: 'rgba(151,187,205,1)',
        //             data: [28, 48, 40, 19, 86, 27, 90]
        //         }
        //     ]
        // };
        //   var myLineChart = new Chart.Line(ctx, 
        // var myNewChart = new Chart(ctx, {
        //     type: "line",
        //     data: dat,
        // });

        // var myLineChart = new Chart.Line(ctx, {lineData, {
        //     scaleShowGridLines: true,
        //     scaleGridLineColor: "rgba(0,0,0,.05)",
        //     scaleGridLineWidth: 1,
        //     bezierCurve: true,
        //     bezierCurveTension: 0.4,
        //     pointDot: true,
        //     pointDotRadius: 4,
        //     pointDotStrokeWidth: 1,
        //     pointHitDetectionRadius: 20,
        //     datasetStroke: true,
        //     datasetStrokeWidth: 2,
        //     datasetFill: true,
        //     legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"}
        // });

    }
}