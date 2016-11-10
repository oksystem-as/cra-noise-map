import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { SensorsSharedService, Overlay, OverlayGroup, Events } from '../sensors-shared.service';
import { MapComponent } from './../map.component';

@Component({
  selector: 'overlays-menu',
  templateUrl: './overlays.menu.component.html',
  styleUrls: ['./overlays.menu.component.css'],
})
export class OverlaysMenuComponent {
  // private googleMap: google.maps.Map;
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
        { checked: false, value: 9, text: "Ldvn", position: 0 }]
    },
    {
      name: "Ostrava",
      overlays: [
        { checked: false, value: 14, text: "Ln", position: 0 },
        { checked: false, value: 15, text: "Ldvn", position: 0 }]
    },
    {
      name: "Brno",
      overlays: [
        { checked: false, value: 17, text: "Ln", position: 0 },
        { checked: false, value: 18, text: "Ldvn", position: 0 }]
    },
    {
      name: "Praha",
      overlays: [
        { checked: false, value: 20, text: "Ln", position: 0 },
        { checked: false, value: 21, text: "Ldvn", position: 0 }]
    },
    {
      name: "Letiště Ruzyně",
      overlays: [
        { checked: false, value: 23, text: "Ln", position: 0 },
        { checked: false, value: 24, text: "Ldvn", position: 0 }]
    }];

  private count: number = 0;

  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
    // sensorsSharedService.listenEventData(Events.mapInstance).subscribe(map => {
    //   if (map != undefined) {
    //     this.googleMap = map;
    //   }
    // });
  }

  // onTerrainMapClick(): void {
  //   this.googleMap.setMapTypeId(google.maps.MapTypeId.TERRAIN);
  // }

  // onSatelliteMapClick(): void {
  //   this.googleMap.setMapTypeId(google.maps.MapTypeId.SATELLITE);
  // }

  // onRoadMapClick(): void {
  //   this.googleMap.setMapTypeId(google.maps.MapTypeId.ROADMAP);
  // }

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