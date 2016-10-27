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

  private limit: number;

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

  updateTable() {
    this.changeDetectorRef.detectChanges();
  }

  constructor(private changeDetectorRef: ChangeDetectorRef, private sensorsSharedService: SensorsSharedService) {
    changeDetectorRef.detach();

    var source = sensorsSharedService.listenEventData(Events.statistics)
      .subscribe(sensorStatistics => {
        this.clearTableData();
        sensorStatistics.statistics.forEach(statis => {
          if (statis.type === this.statisType) {
            statis.avgValues.forEach(value => {
              this.addTableData(Math.round(value.avgValue), value.date);
            })
          }
        });
        this.updateTable();
        // this.sensorsSharedService.publishEvent(Events.showMasterLoading, false);
      });
  }

  ngAfterViewInit(): void {
    this.limit = StatisticsUtils.getLimit(this.statisType);
  }
}