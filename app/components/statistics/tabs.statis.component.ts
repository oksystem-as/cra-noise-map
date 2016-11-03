import { ChangeDetectionStrategy, Component, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { StatisComponent } from './statis.component';
import { StatisticsUtils, Statistics, Statistic, SensorStatistics, StatisType } from '../../utils/statis-utils';
import { SensorsSharedService, Events } from '../sensors-shared.service';

@Component({
    moduleId: module.id,
    selector: 'tabs-statis',
    templateUrl: 'tabs.statis.component.html',
    styleUrls: ['tabs.statis.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class TabsStatisComponent {
    private statisTypeList: StatisType[] = [StatisType.HOUR, StatisType.DAY6_22, StatisType.DAY18_22, StatisType.NIGHT22_6, StatisType.DAY24, StatisType.WEEK, StatisType.MONTH];
    selectedStatisType: StatisType = StatisType.HOUR;
   
    constructor( private sensorsSharedService: SensorsSharedService) {
    }

    setSelectedStatisType(statisType: StatisType) {
        this.selectedStatisType = statisType;
        this.sensorsSharedService.publishEvent(Events.refreshStatisSlider, statisType,  "TabsStatisComponent.setSelectedStatisType");
        this.sensorsSharedService.publishEvent(Events.statisticsTab, statisType, "TabsStatisComponent.setSelectedStatisType");
    }

    getName(statisType: StatisType) {
        return StatisticsUtils.getNameForStatisType(statisType);
    }
}