import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, PACKAGE_ROOT_URL, SimpleChanges, ViewChild } from '@angular/core';
import { StatisComponent } from './statis.component';
import { SensorsSharedService, Events } from '../sensors-shared.service';
import { ObjectUtils, RandomUtils, DateUtils } from '../../utils/utils';
import { StatisticsUtils, StatisType, SensorStatistics, Statistics } from '../../utils/statis-utils';

class DataLabels {
  data: { data: number, label: Date }[];
}

class ShowDataLabels {
  data: { data: number, label: string, labelDate: Date  }[];
}

@Component({
  selector: 'table-statis',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableStatisComponent {

  private allDataLabels: DataLabels = <DataLabels>{ data: [] };
  private showDataLabels: ShowDataLabels = <ShowDataLabels>{ data: [] };

  private sliderStartDate;
  private sliderStopDate;

  private limit: number;
  private mainSliderDate: Date;

  @Input()
  public statisType: StatisType ;

  constructor(private changeDetectorRef: ChangeDetectorRef, private sensorsSharedService: SensorsSharedService) {
    changeDetectorRef.detach();

    sensorsSharedService.listenEventData(Events.sliderNewDate).subscribe(newDate => {
      this.mainSliderDate = DateUtils.getDayFlatDate(new Date(newDate));
      this.updateTable();
    });

    sensorsSharedService.listenEventData(Events.statisSlider).subscribe(data => {
      if (data.statisType === this.statisType) { // pozadavek na globallni nastaveni = > zakomentovat
        this.sliderStartDate = data.startDate;
        this.sliderStopDate = data.endDate;
        this.clearShowTableData();
        this.refreshTableData();
        this.updateTable();
      }
    })

    sensorsSharedService.listenEventData(Events.statistics).delay(300)
      .subscribe(sensorStatistics => {
        this.clearAllTableData();
        sensorStatistics.statistics.forEach(statis => {
          if (statis.type === this.statisType) {
            statis.avgValues.forEach(value => {
              this.allDataLabels.data.push({ data: Math.round(value.avgValue), label: DateUtils.getDayFlatDate(value.date) });
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
      this.showDataLabels.data.push({ data: data, label: this.getDateTextOnType(date), labelDate: date });
  }

  private getDateTextOnType(date: Date): string {
    let text;
    switch (this.statisType) {
      case StatisType.HOUR:
        return DateUtils.toStringZeros(date) + " - " + DateUtils.toStringZerosTimeOnly(DateUtils.getDatePlusMinutes(date, 59));
      case StatisType.DAY6_22:
        return  DateUtils.toStringZeros(new Date(date.setHours(6))) + " - " +  DateUtils.toStringZerosTimeOnly(DateUtils.getDatePlusHours(date, 16));
      case StatisType.DAY18_22:
        return  DateUtils.toStringZeros(new Date(date.setHours(18))) + " - " +  DateUtils.toStringZerosTimeOnly(DateUtils.getDatePlusHours(date, 4));
      case StatisType.NIGHT22_6:
        return  DateUtils.toStringZeros(new Date(date.setHours(22))) + " - " +  DateUtils.toStringZerosTimeOnly(DateUtils.getDatePlusHours(date, 8));
      case StatisType.DAY24:
        return  DateUtils.toStringZeros(date) + " - " + DateUtils.toStringZerosTimeOnly(DateUtils.getMidnight(date));
      case StatisType.WEEK:
        return  DateUtils.toStringZerosDateOnly(date) + " - " + DateUtils.toStringZerosDateOnly(DateUtils.getWeekEndDate(date));
      case StatisType.MONTH:
        return  DateUtils.toStringZerosDateOnly(date) + " - " + DateUtils.toStringZerosDateOnly(DateUtils.getMonthEndDate(date));
      default: throw new Error("Nepodporovany typ: " + this.statisType);
    }
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