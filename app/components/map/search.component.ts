import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { MapComponent } from './../map.component';
import { SensorsSharedService, Overlay, OverlayGroup, Events } from '../sensors-shared.service';

@Component({
    selector: 'search',
    templateUrl: 'app/components/map/search.component.html',
    styleUrls: ['app/components/map/search.component.css'],
})

export class SearchComponent {
    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
        sensorsSharedService.listenEventData(Events.mapInstance).subscribe(map => {
            if (map != undefined) {
                var input = document.getElementById('pac-input') as HTMLInputElement;
                var searchBox = new google.maps.places.SearchBox(input);
                var markers = [];

                // Bias the SearchBox results towards current map's viewport.
                map.addListener('bounds_changed', () => {
                    searchBox.setBounds(map.getBounds());
                });


                // Listen for the event fired when the user selects a prediction and retrieve
                // more details for that place.
                searchBox.addListener('places_changed', () => {
                    var places = searchBox.getPlaces();

                    if (places.length == 0) {
                        return;
                    }

                    // Clear out the old markers.
                    markers.forEach((marker) => {
                        marker.setMap(null);
                    });
                    markers = [];

                    // For each place, get the icon, name and location.
                    var bounds = new google.maps.LatLngBounds();
                    places.forEach((place) => {
                        if (!place.geometry) {
                            console.log("Returned place contains no geometry");
                            return;
                        }
                        var icon = {
                            url: place.icon,
                            size: new google.maps.Size(71, 71),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(17, 34),
                            scaledSize: new google.maps.Size(25, 25)
                        };

                        // Create a marker for each place.
                        markers.push(new google.maps.Marker({
                            map: map,
                            icon: icon,
                            title: place.name,
                            position: place.geometry.location
                        }));

                        if (place.geometry.viewport) {
                            // Only geocodes have viewport.
                            bounds.union(place.geometry.viewport);
                        } else {
                            bounds.extend(place.geometry.location);
                        }
                    });
                    map.fitBounds(bounds);
                });
            }
        });
    }
}