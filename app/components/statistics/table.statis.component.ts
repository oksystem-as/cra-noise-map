import { ChangeDetectionStrategy, Component, AfterViewInit, ViewChild, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { StatisComponent } from './statis.component';


@Component({
  selector: 'table-statis',
  templateUrl: 'app/components/statistics/table.statis.component.html',
  styleUrls: ['app/components/statistics/table.statis.component.css'],
})
export class TableStatisComponent { // implements OnChanges {

  @Input()
  data: any[]

  @Input()
  labels: any[]

  constructor(private ref: ChangeDetectorRef) {
    ref.detach();
    // setInterval(() => {
    //   console.log("TableStatisComponent.detectChanges", this.data, this.labels);
    //   this.ref.detectChanges();
    // }, 5000);
  }

  refresh() {
    // console.log("TableStatisComponent.refresh");
    this.ref.detectChanges();
  }
  
  // ngOnChanges(changes: SimpleChanges) {
  //   this.ref.detectChanges();
  // }

}