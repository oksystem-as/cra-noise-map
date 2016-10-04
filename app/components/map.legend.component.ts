import { Component, Input } from '@angular/core';


@Component({
  selector: 'map-legend',
  templateUrl: 'app/components/map.legend.component.html',
  styleUrls: ['app/components/map.legend.component.css'],
})
export class MapLegendComponent {
  @Input()
  showRuzyneLegend : boolean = false;
  @Input()
  showPrahaLegend : boolean = false;
  @Input()
  showBrnoLegend : boolean = false;
  @Input()
  showOstravaLegend : boolean = false;
  @Input()
  showPrahaBrnoOstravaLegend : boolean = false;
  @Input()
  showZelezniceLegend : boolean = false;
  @Input()
  showSilniceLegend : boolean = false;
}