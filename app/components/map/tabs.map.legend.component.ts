import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { SensorsSharedService, Overlay, OverlayGroup, Events } from '../sensors-shared.service';

@Component({
  selector: 'tabs-map-legend',
  templateUrl: 'app/components/map/tabs.map.legend.component.html',
  styleUrls: ['app/components/map/tabs.map.legend.component.css'],
})
export class TabsMapLegendComponent {
  private overlayGroups: OverlayGroup[] = [{
    name: "Železnice",
    overlays: [
      { checked: false, value: 1, text: "Ln", position: 0 },
      { checked: false, value: 2, text: "Ldvn", position: 0 },
      { checked: false, value: 3, text: "Ln-generalizováno", position: 0 },
      { checked: false, value: 4, text: "Ldvn-generalizováno", position: 0 }]
  },
  {
    name: "Silnice",
    overlays: [
      { checked: false, value: 8, text: "Ln", position: 0 },
      { checked: false, value: 9, text: "Ldvn", position: 0 },]
  },
  {
    name: "Ostrava",
    overlays: [
      { checked: false, value: 14, text: "Ln", position: 0 },
      { checked: false, value: 15, text: "Ldvn", position: 0 },]
  },
  {
    name: "Brno",
    overlays: [
      { checked: false, value: 17, text: "Ln", position: 0 },
      { checked: false, value: 18, text: "Ldvn", position: 0 },]
  },
  {
    name: "Praha",
    overlays: [
      { checked: false, value: 20, text: "Ln", position: 0 },
      { checked: false, value: 21, text: "Ldvn", position: 0 },]
  },
  {
    name: "Letiště Ruzyně",
    overlays: [
      { checked: false, value: 23, text: "Ln", position: 0 },
      { checked: false, value: 24, text: "Ldvn", position: 0 }]
  }];

  //   // ŽELEZNICE
  //   { checked: false, value: 1, group: "Železnice", text: "Ln", position: 0 },
  //   { checked: false, value: 2, group: "", text: "Ldvn", position: 0 },
  //   { checked: false, value: 3, group: "", text: "Ln-generalizováno", position: 0 },
  //   { checked: false, value: 4, group: "", text: "Ldvn-generalizováno", position: 0 },
  //   // { checked: false, value: 5, text: "Oblast výpočtu hlukových hladin železnic", position: 0 },
  //   // { checked: false, value: 6, text: "Železniční trať zahrnutá do výpočtu hlukových hladin", position: 0 },
  //   // SILNICE
  //   { checked: false, value: 8, group: "Silnice", text: "Ln", position: 0 },
  //   { checked: false, value: 9, group: "", text: "Ldvn", position: 0 },
  //   // { checked: false, value: 10, text: "Oblast výpočtu hlukových hladin silnic", position: 0 },
  //   // { checked: false, value: 11, text: "Silnice zahrnuté do výpočtu hlukových hladin", position: 0 },
  //   // HLUK - Praha, Brno, Ostrava
  //   // { checked: false, value: 12, text: "Oblast výpočtu hlukových hladin - Praha - Brno - Ostrava", position: 0 },
  //   // HLUK - Ostrava
  //   { checked: false, value: 14, group: "Ostrava", text: "Ln", position: 0 },
  //   { checked: false, value: 15, group: "", text: "Ldvn", position: 0 },
  //   // HLUK - Brno
  //   { checked: false, value: 17, group: "Brno", text: "Ln", position: 0 },
  //   { checked: false, value: 18, group: "", text: "Ldvn", position: 0 },
  //   // HLUK - Praha
  //   { checked: false, value: 20, group: "Praha", text: "Ln", position: 0 },
  //   { checked: false, value: 21, group: "", text: "Ldvn", position: 0 },
  //   // HLUK - Letiště Ruzyně
  //   { checked: false, value: 23, group: "Letiště Ruzyně", text: "Ln", position: 0 },
  //   { checked: false, value: 24, group: "", text: "Ldvn", position: 0 }
  // ]

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
      this.overlayGroups.forEach(element => {
        element.overlays.forEach(element2 => {
          if (element2.position > overlay.position) {
            element2.position--;
          }
        })
      });
      overlay.position = 0;
    }
    this.sensorsSharedService.publishEvent(Events.mapOverlays, this.overlayGroups);
  }
}