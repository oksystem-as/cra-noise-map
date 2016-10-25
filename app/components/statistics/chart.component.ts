import { Component, AfterViewInit, ViewChild, SimpleChange, Input, ViewEncapsulation, ElementRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService, Events } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { ObjectUtils, RandomUtils, DateUtils } from '../../utils/utils';
import { StatisticsUtils } from '../../utils/statis-utils';

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
export class ChartComponent { //implements AfterViewInit {
    @Input()
    public statisType: StatisType = StatisType.DAY24;
    public chartId = "chartId" + RandomUtils.getRandom();
    public sliderId = "sliderId" + RandomUtils.getRandom();
    private linearChartData: Chart.LineChartData = {
        labels: [],
        datasets: [{
            data: [],
            pointBackgroundColor: [],
            borderWidth: 2,
            borderColor: "#FF7E99",
            backgroundColor: "rgba(255, 71, 108, 0.2)",
            pointBorderColor: "white",
            pointBorderWidth: 1,
            // borderColor: "#FF7E99",
        }
            ,
        {
            data: [],
            // pointBackgroundColor: "blue",
            fill: false,
            // backgroundColor: "rgb(108, 216, 106)",
            borderColor: "rgb(108, 216, 106)",
            pointRadius: 0,
            borderWidth: 1,
        }
        ]
    }
    //{ data: Chart.LineChartData, options?: Chart.LineChartOptions }
    private globalOptions: Chart.LineChartOptions = {
        // showLines: true,
        //  stacked:  true,
        scales: {
            // xAxes: [{
            //     reverse: true,
            //     ticks: {
            //         beginAtZero: true
            //     }
            // }],
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        defaultColor: "blue",
        // scales: {
        //       yAxes: [{
        //         ticks: {
        //             beginAtZero:true
        //         }
        //     }]
        // }
        //defaultColor: "#FF7E99", 
        // scaleShowGridLines: true,
        // scaleGridLineColor: "#FF7E99",
        // borderColor: "#FF7E99",
        // backgroundColor: "#FF7E99",
        // scaleGridLineWidth: 1,
        // bezierCurve: true,
        // bezierCurveTension: 0.4,
        // pointDot: true,
        // pointDotRadius: 4,
        // pointDotStrokeWidth: 1,
        // pointHitDetectionRadius: 20,
        // datasetStroke: true,
        // datasetStrokeWidth: 2,
        maintainAspectRatio: true,
        responsive: false,
        // onClick: handleClick,
    }

    private data = {
        data: this.linearChartData,
        options: this.globalOptions
    }
    private chart: Chart.LineChartInstance;


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
            (dataset.pointBackgroundColor as string[]).push("#FF7E99");
        } else {
            (dataset.pointBackgroundColor as string[]).push("rgb(108, 216, 106)");
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
            })
            .filter(data => {
                if (data.payloads.length == 0) {
                    alert("Zadanému intervalu nevyhovují žádná data.")
                    this.clearChartAndTable();
                }
                return data.payloads.length > 0
            })
            .subscribe(data => {

                this.clearChartAndTable();

                StatisticsUtils.resolveLogAverangeListEvent(data, this.statisType).subscribe(
                    list => {
                        list.forEach(data => {
                            this.addChartData(Math.round(data.logAverange), data.time);
                        })
                    },
                    (err) => { console.log('Error: ' + err); },
                    () => {
                        this.updateChart();
                        this.sensorsSharedService.publishEvent(Events.showMasterLoading, false);
                    });

            });
    }

    ngAfterViewInit(): void {
        var canvas = <HTMLCanvasElement>document.getElementById(this.chartId);
        var ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        this.chart = Chart.Line(ctx, this.data);
    }
}