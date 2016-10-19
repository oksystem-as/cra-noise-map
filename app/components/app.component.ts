import { Component, AfterViewInit } from '@angular/core';
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService } from './sensors-shared.service';

@Component({
  providers: [
    SensorsSharedService
  ],
  selector: 'app-root',
  templateUrl: 'app/components/app.component.html',
  styleUrls: ['app/components/app.component.css'],
})
export class AppComponent {
  // ngAfterViewInit(): void {
  //   var canvas = <HTMLCanvasElement>document.getElementById("myChart2");
  //   var ctx: CanvasRenderingContext2D = canvas.getContext("2d");

  //   let linearChartData: Chart.LineChartData = {
  //     labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
  //     datasets: [{
  //       label: '# of Votes',
  //       data: [12, 19, 3, 5, 2, 3],
  //       pointBackgroundColor: [
  //         'rgba(255, 99, 132, 0.2)',
  //         'rgba(54, 162, 235, 0.2)',
  //         'rgba(255, 206, 86, 0.2)',
  //         'rgba(75, 192, 192, 0.2)',
  //         'rgba(153, 102, 255, 0.2)',
  //         'rgba(255, 159, 64, 0.2)'
  //       ]
  //     }]
  //   }

  //   var data = {
  //     data: linearChartData,
  //     options: {
  //       scaleShowGridLines: true,
  //       scaleGridLineColor: "rgba(0,0,0,.05)",
  //       scaleGridLineWidth: 1,
  //       bezierCurve: true,
  //       bezierCurveTension: 0.4,
  //       pointDot: true,
  //       pointDotRadius: 4,
  //       pointDotStrokeWidth: 1,
  //       pointHitDetectionRadius: 20,
  //       datasetStroke: true,
  //       datasetStrokeWidth: 2,
  //       datasetFill: true,
  //     }
  //   }

  //   var chart = Chart.Line(ctx, data);

  //   linearChartData.datasets[0].data[0] = 1;

  //   setTimeout(() => {
  //     linearChartData.datasets[0].data[0] = 1;
  //     chart.update(1000);
  //   }, 1000)

  //   setTimeout(() => {
  //     chart.data.datasets[0].data[0] = 100;
  //     chart.update(1000);
  //   }, 3000)

  //   setTimeout(() => {
  //     (chart.data.datasets[0].pointBackgroundColor as string[])[0] = "#FFFFFF";
  //     chart.update(1000);
  //   }, 5000)

  // }
}