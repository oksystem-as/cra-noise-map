import { Component, AfterViewInit, ViewChild, SimpleChange, Input, ViewEncapsulation, ElementRef } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService, Events } from '../sensors-shared.service';
import { Sensor } from '../../entity/sensor';
import { Payload, PayloadType } from '../../payloads/payload';
import { ObjectUtils, RandomUtils, DateUtils } from '../../utils/utils';
import { StatisticsUtils, StatisType, SensorStatistics, Statistics } from '../../utils/statis-utils';

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
    selector: 'chart',
    templateUrl: 'chart.component.html',
    styleUrls: ['chart.component.css'],
    // encapsulation: ViewEncapsulation.Native
})
export class ChartComponent implements AfterViewInit {
    @Input()
    public statisType: StatisType = StatisType.DAY24;
    private statistic: Statistics;
    private limit: number;
    private chart: Chart.LineChartInstance;
    public chartId = "chartId" + RandomUtils.getRandom();
    public sliderId = "sliderId" + RandomUtils.getRandom();
    private linearChartData: Chart.LineChartData = {
        labels: [],
        datasets: [{
            data: [],
            // jen pro odlozeni objektu Date
            dataLabels: [],
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

    private globalOptions: Chart.LineChartOptions = {
        // showLines: true,
        //  stacked:  true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }],
            // xAxes: [{
            //     ticks: {
            //         callback: function on(evt: any) {
            //             console.log("tiscks", evt);
            //             return evt.toLocaleDateString();
            //         }
            //     }
            // }]
        },
        defaultColor: "blue",
        legend: {
            display: false,
        },
        maintainAspectRatio: true,
        responsive: false,
        onClick: this.pointClick.bind(this, this.sensorsSharedService),
    }

    private dataChart = {
        data: this.linearChartData,
        options: this.globalOptions
    }

    pointClick (sensorsSharedService, evt, chartElement: any[]) {
        if (chartElement && chartElement.length > 0) {
            let date = this.chart.data.datasets[chartElement[0]._datasetIndex].dataLabels[chartElement[0]._index] as Date;
            let value = this.chart.data.datasets[chartElement[0]._datasetIndex].data[chartElement[0]._index];
            sensorsSharedService.publishEvent(Events.chartPointSelected, { statisType: this.statisType, pointDate: date, pointValue: value })
            this.sensorsSharedService.publishEvent(Events.sliderNewDate, date, "ChartComponent.pointClick");
            this.sensorsSharedService.loadSensorsAndPublish(DateUtils.getDayFlatDate(date));
            // console.log(chartElement, value, date);
        } 
        // else {
        //     console.log("klikni na bod");
        // }
    }


    private updateChart() {
        this.chart.update();
    }

    private addChartData(data: number, date: Date) {
        // console.log(' [updateChart]: ', data, date);
        let dataset = this.dataChart.data.datasets[0];
        let datasetLine = this.dataChart.data.datasets[1];
        let labels = this.dataChart.data.labels;
        dataset.data.push(data);
        dataset.dataLabels.push(date);
        labels.push(date.toLocaleDateString());
        if (this.limit) {
            if (data > this.limit) {
                (dataset.pointBackgroundColor as string[]).push("#FF7E99");
            } else {
                (dataset.pointBackgroundColor as string[]).push("rgb(108, 216, 106)");
            }
            datasetLine.data.push(this.limit);
        }
    }


    private clearChartData() {
        if (this.linearChartData) {
            let dataset = this.dataChart.data.datasets[0];
            let labels = this.dataChart.data.labels;
            dataset.data.length = 0;
            (dataset.pointBackgroundColor as string[]).length = 0;
            labels.length = 0;
            dataset.dataLabels.length = 0;
        }
    }

    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService, elementRef: ElementRef) {

        sensorsSharedService.listenEventData(Events.statisSlider).subscribe(data => {
            // console.log("ChartComponent listen statisSlider", data);
            if (data.statisType === this.statisType) {
                // console.log("ChartComponent listen statisSlider je tam", data);
                this.clearChartData();
                this.statistic.avgValues.forEach(statis => {
                    // console.log("ChartComponent listen statisSlider statis ", statis);
                    if (data.startDate.getTime() < statis.date.getTime() && statis.date.getTime() < data.endDate.getTime()) {
                        this.addChartData(Math.round(statis.avgValue), statis.date);
                    }

                })
                this.updateChart();
            }
        })

        sensorsSharedService.listenEventData(Events.statistics)
            .subscribe(sensorStatistics => {

                // console.log(sensorStatistics)
                sensorStatistics.statistics.forEach(statis => {
                    if (statis.type === this.statisType) {
                        this.clearChartData();
                        this.statistic = statis;
                        statis.avgValues.forEach(value => {
                            this.addChartData(Math.round(value.avgValue), value.date);
                        })
                    }
                });
                this.updateChart();
                this.sensorsSharedService.publishEvent(Events.showMasterLoading, false);
            });
    }

    ngAfterViewInit(): void {
        var canvas = <HTMLCanvasElement>document.getElementById(this.chartId);
        var ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        this.chart = Chart.Line(ctx, this.dataChart);
        this.limit = StatisticsUtils.getLimit(this.statisType);

        if (!this.limit) {
            this.linearChartData.datasets.splice(1, 1);
        }

        //     function handleClick(evt) {
        //     var activeElement = this.chart.getElementAtEvent(evt) as any[];
        //     if (activeElement && activeElement.length > 0) {
        //         console.log(activeElement, this.chart.data.datasets[activeElement[0]._datasetIndex].data[activeElement[0]._index], this.chart.data.labels[activeElement[0]._datasetIndex]);
        //     } else {
        //         console.log("klikni na bod");
        //     }
        // }
    }
}