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
    encapsulation: ViewEncapsulation.None
})
export class ChartComponent implements AfterViewInit {
    @Input()
    public statisType: StatisType = StatisType.DAY24;

    private mainSliderDate = DateUtils.getDayFlatDate(new Date());
    private statistic: Statistics;
    private sliderStartDate;
    private sliderStopDate;
    private limit: number;
    private chart: Chart.LineChartInstance;
    public chartId = "chartId" + RandomUtils.getRandom();
    // public sliderId = "sliderId" + RandomUtils.getRandom();
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
            pointBorderColor: [],
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

    pointClick(sensorsSharedService, evt, chartElement: any[]) {
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

    private refreshChartData() {
        this.clearChartData();
        if (this.statistic) {
            this.statistic.avgValues.forEach(statis => {
                let inInterval = true

                if (this.sliderStartDate || this.sliderStopDate) {
                    inInterval = this.sliderStartDate.getTime() < statis.date.getTime() && statis.date.getTime() < this.sliderStopDate.getTime()
                }

                if (inInterval) {
                    this.addChartData(Math.round(statis.avgValue), statis.date);
                }
            })
        }
    }

    private addChartData(data: number, date: Date) {
        // console.log(' [updateChart]: ', data, date);
        let dataset = this.dataChart.data.datasets[0];
        let datasetLine = this.dataChart.data.datasets[1];
        let labels = this.dataChart.data.labels;
        let backColList = (dataset.pointBackgroundColor as string[]);
        let borderColList = (dataset.pointBorderColor as string[]);

        dataset.data.push(data);
        dataset.dataLabels.push(date);
        labels.push(date.toLocaleDateString());

        if (this.limit) {
            if (data > this.limit) {
                backColList.push("#FF7E99");
            } else {
                backColList.push("rgb(108, 216, 106)");
            }
            datasetLine.data.push(this.limit);
        } else {
            backColList.push("rgb(108, 216, 106)");
        }

        if (this.compareSliderPointDates(this.mainSliderDate, date)) {
            borderColList.push("#0989C9");
        } else {
            borderColList.push("white");
        }
    }



    private clearChartData() {
        if (this.linearChartData) {
            let dataset = this.dataChart.data.datasets[0];
            let labels = this.dataChart.data.labels;
            dataset.data.length = 0;
            (dataset.pointBackgroundColor as string[]).length = 0;
            (dataset.pointBorderColor as string[]).length = 0;
            labels.length = 0;
            dataset.dataLabels.length = 0;
        }
    }

    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService, elementRef: ElementRef) {

        sensorsSharedService.listenEventData(Events.sliderNewDate).subscribe(newDate => {
            this.mainSliderDate = DateUtils.getDayFlatDate(new Date(newDate));
            this.refreshChartData();
            this.updateChart();
        });

        sensorsSharedService.listenEventData(Events.statisSlider).subscribe(data => {
            if (data.statisType === this.statisType) {
                this.sliderStartDate = data.startDate;
                this.sliderStopDate = data.endDate;
                this.refreshChartData();
                this.updateChart();
            }
        })

        sensorsSharedService.listenEventData(Events.statistics)
            .subscribe(sensorStatistics => {
                sensorStatistics.statistics.forEach(statis => {
                    if (statis.type === this.statisType) {
                        this.clearChartData();
                        this.statistic = statis;
                        this.sliderStartDate = undefined;
                        this.sliderStopDate = undefined;
                        statis.avgValues.forEach(value => {
                            this.addChartData(Math.round(value.avgValue), value.date);
                        })
                    }
                });
                this.updateChart();
                // this.sensorsSharedService.publishEvent(Events.showMasterLoading, false);
            });
    }

    /**
     * porovna vybrany den hlavniho slideru s bodem v grafu 
     */
    private compareSliderPointDates(mainSliderDate: Date, pointDate: Date) {
        switch (this.statisType) {
            case StatisType.DAY6_22:
            case StatisType.DAY18_22:
            case StatisType.NIGHT22_6:
            case StatisType.DAY24:
            case StatisType.HOUR:
                let flatDateDPoint = DateUtils.getDayFlatDate(new Date(pointDate));
                let flatDateDSlider = DateUtils.getDayFlatDate(new Date(this.mainSliderDate));
                return flatDateDSlider.getTime() === flatDateDPoint.getTime()
            case StatisType.WEEK:
                let flatDateWPoint = DateUtils.getWeekFlatDate(new Date(pointDate));
                let flatDateWSlider = DateUtils.getWeekFlatDate(new Date(this.mainSliderDate));
                return flatDateWSlider.getTime() === flatDateWPoint.getTime()
            case StatisType.MONTH:
                let flatDateMPoint = DateUtils.getMonthFlatDate(new Date(pointDate));
                let flatDateMSlider = DateUtils.getMonthFlatDate(new Date(this.mainSliderDate));
                return flatDateMSlider.getTime() === flatDateMPoint.getTime()
        }
    }

    ngAfterViewInit(): void {
        var canvas = <HTMLCanvasElement>document.getElementById(this.chartId);
        var ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        this.chart = Chart.Line(ctx, this.dataChart);
        this.limit = StatisticsUtils.getLimit(this.statisType);

        if (!this.limit) {
            this.linearChartData.datasets.splice(1, 1);
        }
    }
}