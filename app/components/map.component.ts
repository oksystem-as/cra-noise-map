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
  private mapId = "map"
  private map;
  private heatmap;
  private makers: google.maps.Marker[] = [];
  private points: Point[] = [];
  private chkbox = false;
  private overlays: { checked: boolean, value: number, text: string }[] = [
    // ŽELEZNICE
    { checked: false, value: 1, text: "Železnice-Ln" },
    { checked: false, value: 2, text: "Železnice-Ldvn" },
    { checked: false, value: 3, text: "Železnice-Ln-generalizováno" },
    { checked: false, value: 4, text: "Železnice-Ldvn-generalizováno" },
    { checked: false, value: 5, text: "Oblast výpočtu hlukových hladin železnic" },
    { checked: false, value: 6, text: "Železniční trať zahrnutá do výpočtu hlukových hladin" },
    // SILNICE
    { checked: false, value: 8, text: "Silnice-Ln" },
    { checked: false, value: 9, text: "Silnice-Ldvn" },
    { checked: false, value: 10, text: "Oblast výpočtu hlukových hladin silnic" },
    { checked: false, value: 11, text: "Silnice zahrnuté do výpočtu hlukových hladin" },
    // HLUK - Praha, Brno, Ostrava
    { checked: false, value: 12, text: "Oblast výpočtu hlukových hladin - Praha - Brno - Ostrava" },
    // HLUK - Ostrava
    { checked: false, value: 14, text: "Ostrava-Ln" },
    { checked: false, value: 15, text: "Ostrava-Ldvn" },
    // HLUK - Brno
    { checked: false, value: 17, text: "Brno-Ln" },
    { checked: false, value: 18, text: "Brno-Ldvn" },
    // HLUK - Praha
    { checked: false, value: 20, text: "Praha-Ln" },
    { checked: false, value: 21, text: "Praha-Ldvn" },
    // HLUK - Letiště Ruzyně
    { checked: false, value: 23, text: "Letiště Ruzyně-Ln" },
    { checked: false, value: 24, text: "Letiště Ruzyně-Ldvn" }
  ]
  private noiseMapType;

  private isLayerSelected() {
    var returnValue = false;
    this.overlays.forEach(element => {
      if (element.checked) {
        returnValue = true;
      }
    });
    return returnValue;
  }

  private iconOff = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    size: 20,
    strokeColor: '#393',
    fillColor: 'yellow',
    fillOpacity: 1,
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

  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.addNewDataListener();
  }

  private initMap() {
    this.map = new google.maps.Map(document.getElementById(this.mapId), {
      zoom: 16,
      center: { lat: 50.053942, lng: 14.437404 },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DEFAULT,
        position: google.maps.ControlPosition.LEFT_BOTTOM,
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN, 'noise'/*, 'noise2016'*/]
      }
    });

    var centerControlDiv = document.getElementById('chkboxs');
    this.map.controls[google.maps.ControlPosition.LEFT_CENTER].push(centerControlDiv);

    this.noiseMapType = new google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => {
        var proj = this.map.getProjection();
        var zfactor = Math.pow(2, zoom);
        // get Long Lat coordinates
        var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
        var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));

        //corrections for the slight shift of the SLP (mapserver)
        var deltaX = 0.0
        var deltaY = 0.0;

        //create the Bounding box string
        var bbox = (top.lng() + deltaX) + "," +
          (bot.lat() + deltaY) + "," +
          (bot.lng() + deltaX) + "," +
          (top.lat() + deltaY);

        // determinate which layers should be shown
        var layers = "";
        this.overlays.forEach(element => {
          if (element.checked) {
            layers += element.value + ',';
          }
        });
        layers = layers.substring(0, layers.length - 1);

        //base WMS URL
        var url = "http://geoportal.gov.cz/ArcGIS/services/CENIA/cenia_hluk/MapServer/WMSServer?";
        url += "SERVICE=WMS";         //WMS service
        url += "&LAYERS=" + layers;   //WMS layers
        url += "&TRANSPARENT=TRUE";   //layer transparency
        url += "&FORMAT=image%2Fpng"; //output format       
        url += "&VERSION=1.3.0";      //WMS version  
        url += "&REQUEST=GetMap";     //WMS operation
        url += "&STYLES=";            //WMS style
        url += "&CRS=CRS:84";         //set WGS84 
        url += "&BBOX=" + bbox;       //set bounding box
        url += "&WIDTH=256";
        url += "&HEIGHT=256";
        this.log.debug(url);
        return url;                 // return URL for the tile
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 26,
      minZoom: 0,
      name: 'noise'
    });
  }

  private onChkboxClick(payload) {
    // on/off selected map layer
    if (payload.checked == true) {
      this.map.overlayMapTypes.push(this.noiseMapType);
    } else {
      this.map.overlayMapTypes.pop();
    }
  }

  // Normalizes the coords that tiles repeat across the x axis (horizontally)
  // like the standard Google map tiles.
  public getNormalizedCoord(coord, zoom) {
    var y = coord.y;
    var x = coord.x;

    // tile range in one direction range is dependent on zoom level
    // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
    var tileRange = 1 << zoom;

    // don't repeat across y-axis (vertically)
    if (y < 0 || y >= tileRange) {
      return null;
    }

    // repeat across x-axis
    if (x < 0 || x >= tileRange) {
      // x = (x % tileRange + tileRange) % tileRange;
    }

    return { x: x, y: y };
  }

  private addNewDataListener() {
    this.sensorsSharedService.getGps().subscribe((payloads: ARF8084BAPayload[]) => {
      // odstranim predchozi markery
      this.removeMarkers();
      this.removeHeatMap();

      var i = 1;
      payloads.forEach(payload => {

        if (payload.longtitude != undefined && payload.latitude != undefined) {
          this.log.debug("kreslim ", payload.latitude, payload.longtitude);

          var infowindow = this.createInfoWindow(payload.latitudeText + " " + payload.longtitudeText + " hluk: " + payload.temp);
          this.createMarker(payload.latitude, payload.longtitude, infowindow);
          this.createHeatPoint(payload.latitude, payload.longtitude, payload.temp);
        }
      });

      this.log.debug("pocet bodu " + this.points.length)
      //this.createHeatMap();
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
      title: latitude.toString(),
    });

    marker.addListener('click', () => {
      infoWin.open(this.map, marker);
    });

    marker.addListener('mouseover', () => {
      // marker.setAnimation(google.maps.Animation.BOUNCE);
      marker.setIcon(this.iconOn)
      this.log.debug(latitude, longtitude)
    });

    marker.addListener('mouseout', () => {
      marker.setIcon(this.iconOff)
    });

    this.makers.push(marker);
    return marker;
  }
}