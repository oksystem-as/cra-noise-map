import { ChangeDetectionStrategy, Component,AfterViewInit, ViewChild } from '@angular/core';
import { StatisComponent } from './statis.component';

 
@Component({
    moduleId: module.id,
    selector: 'tabs-statis',
    templateUrl: 'tabs.statis.component.html',
    styleUrls: ['tabs.statis.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsStatisComponent {
}