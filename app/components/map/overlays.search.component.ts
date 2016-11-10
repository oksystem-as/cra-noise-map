import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { MapComponent } from './../map.component';
import { SensorsSharedService, Overlay, OverlayGroup, Events } from '../sensors-shared.service';

@Component({
  selector: 'overlays-search',
  templateUrl: 'app/components/map/overlays.search.component.html',
  styleUrls: ['app/components/map/overlays.search.component.css'],
})

export class OverlaysSearchComponent {

  private searchBox: google.maps.places.SearchBox;

  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
    sensorsSharedService.listenEventData(Events.mapInstance).subscribe(map => {
      if (map != undefined) {
        var input = document.getElementById('pac-input') as HTMLInputElement;
        var searchBox = new google.maps.places.SearchBox(input);
      }
    });
  }

  private triggerSearch() {
    google.maps.event.trigger(this.searchBox, 'place_changed');
    google.maps.event.trigger(this.searchBox, 'bounds_changed');
  }

}