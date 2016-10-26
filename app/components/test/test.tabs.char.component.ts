import { Component, AfterViewInit } from '@angular/core';
import { SensorsSharedService } from '../sensors-shared.service';

@Component({
  moduleId: module.id,
  selector: 'tabs-test',
  templateUrl: 'test.tabs.char.component.html',
})
export class TabTestComponent {
  ngAfterViewInit(): void {
    this.createChart("myChart1");
    this.createChart("myChart2");
  }

  private createChart(id: string) {
    var canvas = <HTMLCanvasElement>document.getElementById(id);
    var ctx: CanvasRenderingContext2D = canvas.getContext("2d");

    let linearChartData: Chart.LineChartData = {
      labels: ["Red" , "Blue", "Yellow", "Green", "Purple", "Orange"],
      datasets: [{
        label: '# of Votes - ' + id,
        data: [12, 19, 3, 5, 2, 3],
        pointBackgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ]
      }]
    }

    var data = {
      data: linearChartData,
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
        onClick: handleClick,
      }
    }

    var chart = Chart.Line(ctx, data);
    function handleClick(evt)
    {
      var activeElement = chart.getElementAtEvent(evt) as any[];
      if(activeElement && activeElement.length > 0){
        console.log(activeElement, chart.data.datasets[activeElement[0]._datasetIndex].data[activeElement[0]._index], chart.data.labels[activeElement[0]._datasetIndex]);
      } else {
          console.log("klikni na bod");
      }
    }

    linearChartData.datasets[0].data[0] = 1;

    setTimeout(() => {
      linearChartData.datasets[0].data[0] = 1;
      chart.update(1000);
    }, 1000)

    setTimeout(() => {
      chart.data.datasets[0].data[0] = 100;
      chart.update(1000);
    }, 3000)

    setTimeout(() => {
      (chart.data.datasets[0].pointBackgroundColor as string[])[0] = "#FFFFFF";
      chart.update(1000);
    }, 5000)
  }
}