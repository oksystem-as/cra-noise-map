import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, PACKAGE_ROOT_URL, SimpleChanges, ViewChild } from '@angular/core';
import { StatisComponent } from './statis.component';
import { SensorsSharedService, Events } from '../sensors-shared.service';
import { ObjectUtils, RandomUtils, DateUtils } from '../../utils/utils';
import { StatisticsUtils, StatisType, SensorStatistics, Statistics } from '../../utils/statis-utils';

class DataLabels {
  data: { data: number, label: Date }[];
}

@Component({
  moduleId: module.id,
  selector: 'table-statis',
  templateUrl: 'table.component.html',
  styleUrls: ['table.component.css'],
})
export class TableStatisComponent { // implements OnChanges {

  private allDataLabels: DataLabels = <DataLabels>{ data: [] };
  private showDataLabels: DataLabels = <DataLabels>{ data: [] };

  private sliderStartDate;
  private sliderStopDate;

  private limit: number;
  private mainSliderDate: Date;

  @Input()
  public statisType: StatisType = StatisType.DAY24;
  

  constructor(private changeDetectorRef: ChangeDetectorRef, private sensorsSharedService: SensorsSharedService) {
    changeDetectorRef.detach();

    sensorsSharedService.listenEventData(Events.sliderNewDate).subscribe(newDate => {
      this.mainSliderDate = DateUtils.getDayFlatDate(new Date(newDate));
      this.updateTable();
    });

    sensorsSharedService.listenEventData(Events.statisSlider).subscribe(data => {
      if (data.statisType === this.statisType) {
        this.sliderStartDate = data.startDate;
        this.sliderStopDate = data.endDate;
        this.refreshTableData();
        this.updateTable();
      }
    })

    sensorsSharedService.listenEventData(Events.statistics)
      .subscribe(sensorStatistics => {
        this.clearTableData();
        sensorStatistics.statistics.forEach(statis => {
          if (statis.type === this.statisType) {
            statis.avgValues.forEach(value => {
              this.allDataLabels.data.push({ data: Math.round(value.avgValue), label: value.date });
            })
            this.refreshTableData();
            this.updateTable();
          }
        });
      });
  }

  ngAfterViewInit(): void {
    this.limit = StatisticsUtils.getLimit(this.statisType);
  }

  private refreshTableData() {
    this.clearTableData();
    if (this.allDataLabels) {
      this.allDataLabels.data.forEach(data => {
        let inInterval = true

        if (this.sliderStartDate || this.sliderStopDate) {
          inInterval = this.sliderStartDate.getTime() < data.label.getTime() && data.label.getTime() < this.sliderStopDate.getTime()
        }

        if (inInterval) {
          this.addTableData(data.data, data.label);
        }
      })
    }
  }

  addTableData(data: number, date: Date) {
    this.showDataLabels.data.push({ data: data, label: date });
  }

  getDateString(date: Date) {
    let label = date.toLocaleDateString();
    if (this.statisType === StatisType.HOUR) {
      label = date.toLocaleString();
    }
    return label;
  }

  clearTableData() {
    this.showDataLabels.data.length = 0;
  }

  updateTable() {
    this.changeDetectorRef.detectChanges();
  }

  isChoosen(label: Date) {
    return StatisticsUtils.compareSliderPointDates(this.mainSliderDate, label, this.statisType);
  }

}