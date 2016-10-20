import { Component, AfterViewInit, ViewChild, SimpleChange, Input, ViewEncapsulation, ElementRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService, Events } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { RxUtils, ObjectUtils, RandomUtils, DateUtils } from '../../utils/utils';

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
    moduleId: module.id,
    selector: 'chart',
    templateUrl: 'chart.component.html',
    styleUrls: ['chart.component.css'],
    // encapsulation: ViewEncapsulation.Native
})

//   backgroundColor?: string
//       borderColor?: string | Array<string>
//       borderCapStyle?: string
//       borderDash?: Array<number>
//       borderDashOffset?: number
//       borderJoinStyle?: string
//       pointBorderColor?: string | Array<string>
//       pointBorderWidth?: number | Array<number>
//       pointBackgroundColor?: string | Array<string>
//       pointHoverRadius?: number | Array<number>
//       pointHoverBackgroundColor?: string | Array<string>
//       pointHoverBorderColor?: string | Array<string>
//       pointHoverBorderWidth?: number | Array<number>
//       pointRadius?: number | Array<number>
//       tension?: number
//       yAxisID?: string
//       data: Array<number>
export class ChartComponent { //implements AfterViewInit {
    public chartId = "chartId" + RandomUtils.getRandom();
    public sliderId = "sliderId" + RandomUtils.getRandom();
    private linearChartData: Chart.LineChartData = {
        labels: [],
        datasets: [{
            data: [],
            pointBackgroundColor: []
        },
        {
            data: [],
            pointBackgroundColor: "blue",
            // backgroundColor: "white",
            borderColor: "red",
            pointRadius: 1,
            tension: 10,
        }]
    }
    //{ data: Chart.LineChartData, options?: Chart.LineChartOptions }
    private data = {
        data: this.linearChartData,
        options: {
            scaleShowGridLines: true,
            scaleGridLineColor: "rgba(0,0,0,.05)",
            scaleGridLineWidth: 1,
            bezierCurve: true,
            bezierCurveTension: 0.4,
            pointDot: true,
            pointDotRadius: 4,
            pointDotStrokeWidth: 1,
            pointHitDetectionRadius: 20,
            datasetStroke: true,
            datasetStrokeWidth: 2,
            datasetFill: true,
            maintainAspectRatio: true,
            responsive: false,
            // onClick: handleClick,
        }
    }
    private chart: Chart.LineChartInstance;
    @Input()
    public statisType: StatisType = StatisType.DAY24;

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

    private updateChart() {
        this.chart.update();
    }

    private addChartData(data: number, date: Date) {
        // console.log(' [updateChart]: ', data, date);
        let dataset = this.linearChartData.datasets[0];
        let datasetLine = this.linearChartData.datasets[1];
        let labels = this.linearChartData.labels;
        dataset.data.push(data);
        labels.push(this.getDateFormat(date));
        let limit = 83;
        if (data > limit) {
            (dataset.pointBackgroundColor as string[]).push("red");
        } else {
            (dataset.pointBackgroundColor as string[]).push("green");
        }
        datasetLine.data.push(limit);
    }

    private clearChartAndTable() {
        if (this.linearChartData) {
            let dataset = this.linearChartData.datasets[0];
            let labels = this.linearChartData.labels;
            dataset.data.length = 0;
           (dataset.pointBackgroundColor as string[]).length = 0;
            labels.length = 0;
       
        }
    }


    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService, elementRef: ElementRef) {
        var source = sensorsSharedService.listenEventData(Events.statistics)
            .filter(data => {
                return data != undefined && data.payloads != undefined && data.payloadType == PayloadType.ARF8084BA &&
                    (data.publisher == undefined || data.publisher == this.sliderId || data.publisher == "menuItem" || data.publisher == "markerItem")
            }).filter(data => {
                if (data.payloads.length == 0) {
                    alert("Zadanému intervalu nevyhovují žádná data.")
                    this.clearChartAndTable();
                }
                return data.payloads.length > 0
            }).subscribe(data => {
                var element = data.payloads[0];
                this.clearChartAndTable();

                // if (this.firstInitSlider) {
                //     this.removeSlider();
                //     this.initSlider(data.payloads[0].createdAt);
                //     this.firstInitSlider = false;
                // } else if (data.publisher == "menuItem" || data.publisher == "markerItem") {
                //     // pokud je vyber z menu je potreba provest reset 
                //     this.removeSlider();
                //     this.initSlider(data.payloads[0].createdAt);
                //     this.firstInitSlider = false;
                // }

                // this.devEUI = data.devEUI;

                // 1. vytvarim novy stream jelikoz stream getStatisticsData() se neuzavira a nektere volani 
                // (reduce(), last() atp.) cekaji na completed resp uzavreni streamu, ktereho se nedockaji ...
                // 2. musim provest deep copy listu a v nem obs. objektu jinak dochayi k modifikaci objektu napric streamy 
                switch (this.statisType) {
                    case StatisType.HOUR: {
                        // log.debug('hodinovy prumer: ');
                        this.resolveLogAverange(RxUtils.groupByHours(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    case StatisType.DAY6_22: {
                        // log.debug('denni 6-22 prumer: ');
                        this.resolveLogAverange(RxUtils.groupByDay(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    case StatisType.DAY18_22: {
                        // log.debug('denni 18-22 prumer: ');
                        this.resolveLogAverange(RxUtils.groupBy18_22(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    case StatisType.NIGHT22_6: {
                        // log.debug('nocni 22-6 prumer: ');
                        this.resolveLogAverange(RxUtils.groupByNight(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    case StatisType.DAY24: {
                        // log.debug('denni 24h prumer: ');
                        this.resolveLogAverange(RxUtils.groupByDays(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    case StatisType.WEEK: {
                        // log.debug('tydeni prumer: ');
                        this.resolveLogAverange(RxUtils.groupByWeek(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    case StatisType.MONTH: {
                        // log.debug('mesicni prumer: ');
                        this.resolveLogAverange(RxUtils.groupByMonth(ObjectUtils.deepCopyArr(data.payloads)));
                        break;
                    }
                    default: throw "nepodporovany graf " + this.statisType;
                }
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

            // // // zobrazeni a spusteni straemu
            logAvgDataStream.subscribe(
                data => {
                    // console.log(' [data]: ', data.time.toLocaleString(), ' logAverange: ' + data.logAverange);
                    this.addChartData(Math.round(data.logAverange), data.time);

                },
                (err) => { console.log('Error: ' + err); },
                () => { /*console.log('Completed')*/ });
        },
        (err) => { console.log('Error: ' + err); },
        () => { this.updateChart(); });
    }

    private getValue(payload: Payload): number {
        if (payload.payloadType == PayloadType.ARF8084BA) {
            return (payload as ARF8084BAPayload).temp;
        }
        if (payload.payloadType == PayloadType.RHF1S001) {
            return (payload as RHF1S001Payload).teplota;
        }

    }

    ngAfterViewInit(): void {
        var canvas = <HTMLCanvasElement>document.getElementById(this.chartId);
        var ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        this.chart = Chart.Line(ctx, this.data);
    }
    //     var canvas = <HTMLCanvasElement>document.getElementById(this.chartId);
    //     var ctx: CanvasRenderingContext2D = canvas.getContext("2d");

    //     this.linearChartData = {
    //         labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    //         datasets: [{
    //             label: '# of Votes - ' + this.chartId,
    //             data: [12, 19, 3, 5, 2, 3],
    //             pointBackgroundColor: [
    //                 'rgba(255, 99, 132, 0.2)',
    //                 'rgba(54, 162, 235, 0.2)',
    //                 'rgba(255, 206, 86, 0.2)',
    //                 'rgba(75, 192, 192, 0.2)',
    //                 'rgba(153, 102, 255, 0.2)',
    //                 'rgba(255, 159, 64, 0.2)'
    //             ]
    //         }]
    //     }

    //     var data = {
    //         data: this.linearChartData,
    //         options: {
    //             scaleShowGridLines: true,
    //             scaleGridLineColor: "rgba(0,0,0,.05)",
    //             scaleGridLineWidth: 1,
    //             bezierCurve: true,
    //             bezierCurveTension: 0.4,
    //             pointDot: true,
    //             pointDotRadius: 4,
    //             pointDotStrokeWidth: 1,
    //             pointHitDetectionRadius: 20,
    //             datasetStroke: true,
    //             datasetStrokeWidth: 2,
    //             datasetFill: true,
    //             maintainAspectRatio: true,
    //             responsive: false,
    //             onClick: handleClick,
    //         }
    //     }

    //     var chart = Chart.Line(ctx, data);
    //     function handleClick(evt) {
    //         var activeElement = chart.getElementAtEvent(evt) as any[];
    //         if (activeElement && activeElement.length > 0) {
    //             console.log(activeElement, chart.data.datasets[activeElement[0]._datasetIndex].data[activeElement[0]._index], chart.data.labels[activeElement[0]._datasetIndex]);
    //         } else {
    //             console.log("klikni na bod");
    //         }
    //     }

    // linearChartData.datasets[0].data[0] = 1;

    // setTimeout(() => {
    //     linearChartData.datasets[0].data[0] = 1;
    //     chart.update(1000);
    // }, 1000)

    // setTimeout(() => {
    //     chart.data.datasets[0].data[0] = 100;
    //     chart.update(1000);
    // }, 3000)

    // setTimeout(() => {
    //     (chart.data.datasets[0].pointBackgroundColor as string[])[0] = "#FFFFFF";
    //     chart.update(1000);
    // }, 5000)
    // }

}