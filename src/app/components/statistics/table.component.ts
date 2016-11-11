import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, PACKAGE_ROOT_URL, SimpleChanges, ViewChild } from '@angular/core';
import { StatisComponent } from './statis.component';
import { SensorsSharedService, Events } from '../sensors-shared.service';
import { ObjectUtils, RandomUtils, DateUtils } from '../../utils/utils';
import { StatisticsUtils, StatisType, SensorStatistics, Statistics } from '../../utils/statis-utils';

class DataLabels {
  data: { data: number, label: Date }[];
}

@Component({
  selector: 'table-statis',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableStatisComponent {

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
      // if (data.statisType === this.statisType) { // pozadavek na globallni nastaveni
      this.sliderStartDate = data.startDate;
      this.sliderStopDate = data.endDate;
      this.clearShowTableData();
      this.refreshTableData();
      this.updateTable();
      // }
    })

    sensorsSharedService.listenEventData(Events.statistics).delay(200)
      .subscribe(sensorStatistics => {
        this.clearAllTableData();
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

  private onRowClick(label: Date) {
    this.sensorsSharedService.publishEvent(Events.sliderNewDate, label, "TableStatisComponent.rowClick");
    this.sensorsSharedService.loadSensorsAndPublish(DateUtils.getDayFlatDate(label));
  }

  private refreshTableData() {
    if (this.allDataLabels) {
      this.allDataLabels.data.forEach(data => {
        let inInterval = true

        if (this.sliderStartDate || this.sliderStopDate) {
          inInterval = this.sliderStartDate.getTime() <= data.label.getTime() && data.label.getTime() <= this.sliderStopDate.getTime()
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

  clearShowTableData() {
    this.showDataLabels.data.length = 0;
  }

  clearAllTableData() {
    this.sliderStartDate = null;
    this.sliderStopDate = null;
    this.showDataLabels.data.length = 0;
    this.allDataLabels.data.length = 0;
  }

  updateTable() {
    this.changeDetectorRef.detectChanges();
  }

  isChoosen(label: Date) {
    return StatisticsUtils.compareSliderPointDates(this.mainSliderDate, label, this.statisType);
  }

  offLimit(data: number) {
    return this.limit != undefined && data > this.limit
  }
}