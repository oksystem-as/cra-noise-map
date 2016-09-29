import { Component, AfterViewInit, ViewChild, SimpleChange } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService } from './sensors-shared.service';
import { Sensor } from '../entity/sensor';
import { Payload, PayloadType } from '../payloads/payload';
import { RxUtils } from '../utils/utils';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../service/cra.service';
import { Observable } from 'rxjs/Observable';
import { GroupedObservable } from 'rxjs/operator/groupBy';
import { BehaviorSubject } from "rxjs/Rx";
import 'rxjs/Rx';
import { ChartsModule, BaseChartComponent } from 'ng2-charts/ng2-charts';


@Component({
    selector: 'statistics',
    templateUrl: 'app/components/statistics.component.html',
    styleUrls: ['app/components/statistics.component.css'],
})
export class StatisticsComponent implements AfterViewInit {
    @ViewChild('myChart') 
    private _chart;

    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true
    };
    public barChartLabels: string[] = [];
    public barChartType: string = 'bar';
    public barChartLegend: boolean = false;

    public barChartData: any[] = [];

    // events
    public chartClicked(e: any): void {
        // console.log(e);
    }

    public chartHovered(e: any): void {
        // console.log(e);
    }

    private updateChart(data: number, label: string){
        this.barChartData.push(data);
        this.barChartLabels.push(label);
        let sch = new SimpleChange(this.barChartData, this.barChartData);
        let obj = {data: sch};
        this._chart.ngOnChanges(obj);
    }

    public randomize(): void {
        
        this.barChartLabels =  ["a","b","c"]
        let sch = new SimpleChange(this.barChartData, [12,13,15]);
        let lab = new SimpleChange(this.barChartLabels, ["a1","b2","c3"]);
        let obj = {data: sch, labels: lab}
        // this._chart.update();
        this._chart.ngOnChanges(obj)
        // Only Change 3 values
        // let data = [
        //     Math.round(Math.random() * 100),
        //     59,
        //     80,
        //     (Math.random() * 100),
        //     56,
        //     (Math.random() * 100),
        //     40];
        // let clone = JSON.parse(JSON.stringify(this.barChartData));
        // clone[0].data = data;
        // this.barChartData = clone;
        /**
         * (My guess), for Angular to recognize the change in the dataset
         * it has to change the dataset variable directly,
         * so one way around it, is to clone the data, change it and then
         * assign it;
         */
    }

    private dayStatis;
    private prumerZaHodinu;
    private prumerZaDen;
    private prumerZaTyden;
    private prumerZaMesic;
    private statisticsData: Observable<Payload>;


    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
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



        var source = sensorsSharedService.getStatisticsData()
            .filter(data => {
                return data != undefined && data.payloads != undefined && data.payloadType == PayloadType.ARF8084BA
            }).subscribe(data => {

                // 1. vytvarim novy stream jelikoz stream getStatisticsData() se neuzavira a nektere volani 
                // (reduce(), last() atp.) cekaji na completed resp uzavreni streamu, ktereho se nedockaji ...
                // 2. musim provest deep copy listu a v nem obs. objektu jinak dochayi k modifikaci objektu napric streamy 
                // log.debug('hodinovy prumer: ');
                // this.resolveLogAvaerange(RxUtils.groupByHours(this.deepCopyArr(data.payloads)));
                // log.debug('denni 6-22 prumer: ');
                // this.resolveLogAvaerange(RxUtils.groupByDay(this.deepCopyArr(data.payloads)));
                // log.debug('denni 18-22 prumer:: ');
                // this.resolveLogAvaerange(RxUtils.groupBy18_22(this.deepCopyArr(data.payloads)));
                // log.debug('nocni 22-6 prumer: ');
                // this.resolveLogAvaerange(RxUtils.groupByNight(this.deepCopyArr(data.payloads)));
                // log.debug('denni 24h prumer: ');
                // this.resolveLogAvaerange(RxUtils.groupByDays(this.deepCopyArr(data.payloads)));
                // log.debug('tydeni prumer: ');
                // this.resolveLogAvaerange(RxUtils.groupByWeek(this.deepCopyArr(data.payloads)));
                log.debug('mesicni prumer: ');
                this.resolveLogAvaerange(RxUtils.groupByMonth(this.deepCopyArr(data.payloads)));
            });
    }

    private deepCopyArr(array: any[]): any[] {
        var out = [];
        for (var i = 0, len = array.length; i < len; i++) {
            var item = array[i];
            var obj = {};
            for (var k in item) {
                obj[k] = this.deepCopy(item[k], null);
            }
            out.push(obj);
        }
        return out;
    }

    private deepCopy(from, to) {
        // console.log(from, to);
        if (from == null || typeof from != "object") {
            // console.log("prvni");
            return from;
        }
        if (from ! instanceof Object && from ! instanceof Array) {
            // console.log("druhy");
            return from;
        }
        if (from instanceof Date) {
            return new Date(from);
        }
        // TODO i ostani objekty
        if (from instanceof Date || from instanceof RegExp || from instanceof Function ||
            from instanceof String || from instanceof Number || from instanceof Boolean) {
            throw "Ne vsechny objekty momentalne umim klonovat ... :( ) objekt: " + from;
            // return this.newInstance(from, from);
        }

        // console.log("ctvrty - ", from);

        to = to || Object.create(from);

        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? this.deepCopy(from[name], null) : to[name];
        }

        return to;
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
                //     let clone = JSON.parse(JSON.stringify(this.barChartData));
                //     clone.push(Math.round(data.logAverange));
                //     this.barChartData = clone;
                //       console.log(' [data0]: ', this.barChartData);

                //     let clone2 = JSON.parse(JSON.stringify(this.barChartLabels));
                //    clone2.push( data.time.toLocaleDateString());
                //     this.barChartLabels = clone2;
                //      console.log(' [data1]: ', this.barChartLabels);
                //     console.log(' [data]: ', data);
                //     this.barChartData.push(Math.round(data.logAverange));
                //     this.barChartData = this.barChartData.slice();

                //     this.barChartLabels.push( data.time.toLocaleDateString());
                //    this.barChartLabels = this.barChartLabels.slice();

                   this.updateChart(Math.round(data.logAverange), data.time.toLocaleDateString());

                //    this._chart.labels.push( data.time.toLocaleDateString());
                //    this._chart.data.push(Math.round(data.logAverange));

                    // console.log(' [data1]: ', this.barChartData);
                    //setTimeout(())
                     console.log(' [data]: ', data.time.toLocaleString(), ' logAverange: ' + data.logAverange); 
                    // this._chart.addData(Math.round(data.logAverange), data.time.toLocaleDateString())
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

    ngAfterViewInit(): void {
    }
}