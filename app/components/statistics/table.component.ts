import { ChangeDetectionStrategy, Component, AfterViewInit, ViewChild, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { StatisComponent } from './statis.component';
import { SensorsSharedService, Events } from '../sensors-shared.service';
import { StatisticsUtils, StatisType } from '../../utils/statis-utils';


@Component({
  moduleId: module.id,
  selector: 'table-statis',
  templateUrl: 'table.component.html',
  styleUrls: ['table.component.css'],
})
export class TableStatisComponent { // implements OnChanges {

  data: any[] = []
  labels: any[] = []

  @Input()
  public statisType: StatisType = StatisType.DAY24;

  addTableData(data: number, date: Date) {
    this.data.push(data);
    this.labels.push(date.toLocaleDateString());
  }

  clearTableData() {
    this.data.length = 0;
    this.labels.length = 0;
  }

  updateTable(){
    this.changeDetectorRef.detectChanges();
  }

  constructor(private changeDetectorRef: ChangeDetectorRef, private sensorsSharedService: SensorsSharedService) {
    changeDetectorRef.detach();

    var source = sensorsSharedService.listenEventData(Events.statistics)
      .subscribe(statistics => {
        this.clearTableData();
        statistics.forEach(statis => {
          if (statis.statisType === this.statisType) {
            statis.statistic.forEach(data => {
              this.addTableData(Math.round(data.logAverange), data.time);
            })
          }
        });
        this.updateTable();
        // this.sensorsSharedService.publishEvent(Events.showMasterLoading, false);
      });
  }
}