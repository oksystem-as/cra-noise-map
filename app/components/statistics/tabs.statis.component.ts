import { ChangeDetectionStrategy, Component,AfterViewInit, ViewChild } from '@angular/core';
import { StatisComponent } from './statis.component';

 
@Component({
    moduleId: module.id,
    selector: 'tabs-statis',
    templateUrl: 'tabs.statis.component.html',
    styleUrls: ['tabs.statis.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsStatisComponent implements AfterViewInit {
  
  @ViewChild("statis2")
  private timerComponent: StatisComponent;
   
  public onClick(event):void {
    console.log('clicked', event);
  };

  public refreshSlider(data){
    //setTimeout(()=> {this.timerComponent.refreshSlider(data)}, 2000);
    this.timerComponent.refreshSlider(data)
  }

  ngAfterViewInit(): void {
    // console.log(' [TableStatisComponent.ngAfterViewInit]: ', this.timerComponent); 
  }
}