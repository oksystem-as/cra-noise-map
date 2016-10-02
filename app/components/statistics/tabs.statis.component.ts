import { ChangeDetectionStrategy, Component,AfterViewInit } from '@angular/core';
 
@Component({
    selector: 'tabs-statis',
    templateUrl: 'app/components/statistics/tabs.statis.component.html',
    styleUrls: ['app/components/statistics/tabs.statis.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsStatisComponent implements AfterViewInit {

   
  public onClick(event):void {
    console.log('clicked', event);
  };

  ngAfterViewInit(): void {
    console.log(' [TabsStatisComponent.ngAfterViewInit]: '); 
  
    }
}