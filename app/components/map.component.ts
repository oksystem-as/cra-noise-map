import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
//import '../../node_modules/google-maps/lib/Google.js';
// import { CRaService } from '../service/cra.service';
// import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
// import { RHF1S001PayloadResolver } from '../payloads/RHF1S001PayloadResolver';
// import { DeviceDetail } from '../entity/device/detail/device-detail';
import { SensorsSharedService } from './sensors-shared.service';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';

class Point {
  location: google.maps.LatLng;
  weight: number;
}

@Component({
  selector: 'map',
  templateUrl: 'app/components/map.component.html',
  styleUrls: ['app/components/map.component.css'],
})
export class MapComponent implements AfterViewInit {

  private map;
  private heatmap;
  private makers: google.maps.Marker[] = [];
  private points: Point[] = [];

  private iconOff = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    size: 20,
    strokeColor: '#393',
    fillColor: 'yellow',
    fillOpacity: 0.0,
    strokeWeight: 0
  };

  private iconOn = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    size: 20,
    strokeColor: '#393',
    fillColor: 'red',
    fillOpacity: 0.2,
    strokeWeight: 0,
  };

  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.addNewDataListener();
  }

  private initMap() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 8,
      center: { lat: 50.053942, lng: 14.437404 },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DEFAULT,
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
    });
  }

  private addNewDataListener() {
    this.sensorsSharedService.getGps().subscribe((payloads: ARF8084BAPayload[]) => {
      // odstranim predchozi markery - nemusi byt zadouci
      this.removeMarkers();
      this.removeHeatMap();
      var i = 1;

      payloads.forEach(payload => {

        if (payload.longtitude != undefined && payload.latitude != undefined) {
          this.log.debug("kreslim ", payload.latitude, payload.longtitude);

          var infowindow = this.createInfoWindow(payload.latitudeText + " " + payload.longtitudeText);
          this.createMarker(payload.latitude, payload.longtitude, infowindow);
          this.createHeatPoint(payload.latitude, payload.longtitude, payload.temp);
        }
      });
      
      this.log.debug("pocet bodu " + this.points.length)
      this.createHeatMap();
    });
  }

  private removeHeatMap(): void {
    if (this.heatmap != undefined) {
      this.heatmap.setMap(null);
      delete this.heatmap;
    }
    this.points.length = 0;
  }

  private createHeatPoint(latitude: number, longtitude: number, weight: number): Point {
    let point: Point = new Point();
    point.location = new google.maps.LatLng(latitude, longtitude);
    point.weight = weight;
    this.points.push(point);
    return point;
  }

  private createHeatMap(): void {
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: this.points,
      map: this.map,
      radius: 50,
    });
  }

  private removeMarkers() {
    this.makers.forEach(marker => {
      this.log.debug("clear " + marker)
      marker.setMap(null);
    });
    this.makers.length = 0;
  }

  private createInfoWindow(text: string): google.maps.InfoWindow {
    return new google.maps.InfoWindow({
      content: "<div>" + text + "</div>",
      //content: JSON.stringify(payload, null, ' '),
    });
  }

  private createMarker(latitude: number, longtitude: number, infoWin: google.maps.InfoWindow): google.maps.Marker {
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longtitude),
      map: this.map,
      //animation: google.maps.Animation.DROP,
      icon: this.iconOff,
      title: 'Hello World!',
    });

    marker.addListener('click', () => {
      infoWin.open(this.map, marker);
    });

    marker.addListener('mouseover', () => {
      // marker.setAnimation(google.maps.Animation.BOUNCE);
      marker.setIcon(this.iconOn)
    });

    marker.addListener('mouseout', () => {
      marker.setIcon(this.iconOff)
    });

    this.makers.push(marker);
    return marker;
  }
}