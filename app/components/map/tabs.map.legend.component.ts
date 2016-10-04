import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { SensorsSharedService, Overlay } from '../sensors-shared.service';

@Component({
  selector: 'tabs-map-legend',
  templateUrl: 'app/components/map/tabs.map.legend.component.html',
  styleUrls: ['app/components/map/tabs.map.legend.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsMapLegendComponent {
  private overlays: Overlay[] = [
    // ŽELEZNICE
    { checked: false, value: 1, text: "Železnice-Ln", position: 0 },
    { checked: false, value: 2, text: "Železnice-Ldvn", position: 0 },
    { checked: false, value: 3, text: "Železnice-Ln-generalizováno", position: 0 },
    { checked: false, value: 4, text: "Železnice-Ldvn-generalizováno", position: 0 },
    { checked: false, value: 5, text: "Oblast výpočtu hlukových hladin železnic", position: 0 },
    { checked: false, value: 6, text: "Železniční trať zahrnutá do výpočtu hlukových hladin", position: 0 },
    // SILNICE
    { checked: false, value: 8, text: "Silnice-Ln", position: 0 },
    { checked: false, value: 9, text: "Silnice-Ldvn", position: 0 },
    { checked: false, value: 10, text: "Oblast výpočtu hlukových hladin silnic", position: 0 },
    { checked: false, value: 11, text: "Silnice zahrnuté do výpočtu hlukových hladin", position: 0 },
    // HLUK - Praha, Brno, Ostrava
    { checked: false, value: 12, text: "Oblast výpočtu hlukových hladin - Praha - Brno - Ostrava", position: 0 },
    // HLUK - Ostrava
    { checked: false, value: 14, text: "Ostrava-Ln", position: 0 },
    { checked: false, value: 15, text: "Ostrava-Ldvn", position: 0 },
    // HLUK - Brno
    { checked: false, value: 17, text: "Brno-Ln", position: 0 },
    { checked: false, value: 18, text: "Brno-Ldvn", position: 0 },
    // HLUK - Praha
    { checked: false, value: 20, text: "Praha-Ln", position: 0 },
    { checked: false, value: 21, text: "Praha-Ldvn", position: 0 },
    // HLUK - Letiště Ruzyně
    { checked: false, value: 23, text: "Letiště Ruzyně-Ln", position: 0 },
    { checked: false, value: 24, text: "Letiště Ruzyně-Ldvn", position: 0 }
  ]

  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
  }
  private count: number = 0;

  onChkboxClick(overlay: Overlay) {
    this.log.debug("onChkboxClick: ", overlay);
    if (overlay.checked) {
      // add
      this.count++;
      overlay.position = this.count;
    } else {
      // remove
      this.count--;   
      this.overlays.forEach(element => {
        if (element.position > overlay.position) {
          element.position--;
        }
      });
      overlay.position = 0;
    }
    this.sensorsSharedService.setOverlays(this.overlays);
  }
}