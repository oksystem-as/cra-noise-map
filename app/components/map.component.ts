import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
//import '../../node_modules/google-maps/lib/Google.js';
// import { CRaService } from '../service/cra.service';
// import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
// import { RHF1S001PayloadResolver } from '../payloads/RHF1S001PayloadResolver';
// import { DeviceDetail } from '../entity/device/detail/device-detail';.
import { Sensor } from '../entity/sensor';
import { Payload, PayloadType } from '../payloads/payload';
import { SensorsSharedService, Overlay } from './sensors-shared.service';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
<<<<<<< HEAD
import { ObjectUtils } from '../utils/utils';
=======
import { ColorUtils } from '../utils/utils';
>>>>>>> 972a0088b95f294e0a44cf966a7a281cde4eb1cd

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
  // private makers: google.maps.Marker[] = [];
  private makers: any[] = [];
  private points: Point[] = [];
  private chkbox = false;
  private overlays: { checked: boolean, value: number, text: string, position: number }[];
  private noiseMapType;

<<<<<<< HEAD
  private iconOff = {
=======
  private isLayerSelected() {
    var returnValue = false;
    this.overlays.forEach(element => {
      if (element.checked) {
        returnValue = true;
      }
    });
    return returnValue;
  }

  private iconOn = {
>>>>>>> 972a0088b95f294e0a44cf966a7a281cde4eb1cd
    path: google.maps.SymbolPath.CIRCLE,
    scale: 12,
    size: 30,
    // strokeColor: '#444',
    // fillColor: 'red',
    // fillOpacity: 0.8,
    strokeWeight: 4,
    strokeColor: 'red',
  };

  private iconSelected = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 12,
    size: 30,
    strokeColor: '#444',
    fillColor: 'orange',
    fillOpacity: 0.8,
    strokeWeight: 2,
  };


  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.addNewDataListener();
  }

  private initMap() {
    this.map = new google.maps.Map(document.getElementById(this.mapId), {
      zoom: 12,
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
        var unsortedLayers: Overlay[] = ObjectUtils.deepCopyArr(this.overlays);
        this.log.debug("Nesetridene pole", unsortedLayers);
        var sortedLayers: Overlay[] = unsortedLayers.sort((n1, n2) => n1.position - n2.position);
        this.log.debug("Setridene pole", sortedLayers);

        for (let index = 0; index < sortedLayers.length; index++) {
          if (sortedLayers[index].position > 0) {
            layers += sortedLayers[index].value + ',';
          }
        }
        // remove comma (last char)
        if (layers.length > 0) {
          layers = layers.substring(0, layers.length - 1);
          this.log.debug("Vrstvy k vykresleni: ", layers);
        }

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
        url += "&WIDTH=512";
        url += "&HEIGHT=512";
        this.log.debug(url);
        return url;                 // return URL for the tile
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 26,
      minZoom: 0,
      name: 'noise'
    });
<<<<<<< HEAD
    this.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(document.getElementById('statistics'));
    this.map.controls[google.maps.ControlPosition.LEFT_CENTER].push(document.getElementById('tabs-map-legend'));
=======
    this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('statistics'));

    this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(document.getElementById('baseMapLegend'));
    
  }

  private onChkboxClick(payload) {
    // on/off selected map layer
    if (payload.checked == true) {
      this.map.overlayMapTypes.push(this.noiseMapType);
    } else {
      this.map.overlayMapTypes.pop();
    }
>>>>>>> 972a0088b95f294e0a44cf966a7a281cde4eb1cd
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
<<<<<<< HEAD
    this.sensorsSharedService.getOverlays().debounceTime(1500).filter((overlays: Overlay[]) => {
      return overlays != undefined && overlays.length > 0
    }).subscribe((overlays: Overlay[]) => {
      this.overlays = overlays;

      let checked = false;
      for (var index = 0; index < this.overlays.length; index++) {
        let overlay = this.overlays[index];
        if (overlay.checked) {
          checked = true;
          break;
        }
      }
      if (this.map.overlayMapTypes.length > 0) {
        this.map.overlayMapTypes.pop();
      }

      if (checked) {
        this.map.overlayMapTypes.push(this.noiseMapType);
      }
    })
    this.sensorsSharedService.getSensor().subscribe((sensors: Sensor[]) => {
=======

    // zvyrazneni vybraneho
    this.sensorsSharedService.getSelectedSensor().subscribe((sensor: Sensor) => {
      this.makers.forEach(marker => {

        if (marker.sensor.devEUI === sensor.devEUI) {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          marker.setIcon(this.iconSelected)
          marker.isSelected = true;
          setTimeout(() => {
            marker.setAnimation(null);
          }, 500);
          setTimeout(() => {
            marker.setIcon(marker.pomIconNotSelected);
            marker.isSelected = false;
          }, 2000);
          console.log("getSelectedSensor found ", marker);
        } else {
          marker.setIcon(marker.pomIconNotSelected);
          marker.isSelected = false;
        }
      });
    });

    this.sensorsSharedService.getSensors().subscribe((sensors: Sensor[]) => {
>>>>>>> 972a0088b95f294e0a44cf966a7a281cde4eb1cd
      // odstranim predchozi markery
      this.removeMarkers();
      this.removeHeatMap();

      var i = 1;
      sensors.forEach(sensor => {
        if (sensor.payloadType == PayloadType.ARF8084BA) {
          sensor.payloads.forEach((payload: ARF8084BAPayload) => {
            if (payload.longtitude != undefined && payload.latitude != undefined) {
              //this.log.debug("kreslim ", payload.latitude, payload.longtitude);

<<<<<<< HEAD
              var infowindow = this.createInfoWindow(payload.latitudeText + " " + payload.longtitudeText + " hluk: " + payload.temp + " ID: " + sensor.devEUI);
              this.createMarker(payload.latitude, payload.longtitude, infowindow);
=======
              var infowindow = this.createInfoWindow(payload, sensor);
              this.createMarker(payload.latitude, payload.longtitude, infowindow, payload.temp, sensor);
>>>>>>> 972a0088b95f294e0a44cf966a7a281cde4eb1cd
              // this.createHeatPoint(payload.latitude, payload.longtitude, payload.temp);
            }
          });
        }
      });

      this.log.debug("pocet bodu " + this.points.length)
      this.createHeatMap();
    });
  }

  private getColorIcon(value: number) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      size: 30,
      strokeColor: '#444',
      fillColor: ColorUtils.getColor(value),
      fillOpacity: 0.8,
      strokeWeight: 2,
    };
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

  private createInfoWindow(payload: ARF8084BAPayload, sensor: Sensor): google.maps.InfoWindow {
    let text = "<strong>pozice:</strong> " + payload.latitudeText + "N " + payload.longtitudeText + "E<br> " +
      "<strong>hluk:</strong> " + payload.temp + "dB<br> " +
      "<strong>ID:</strong> " + sensor.devEUI;

    return new google.maps.InfoWindow({
      content: "<div class='info-window'>" + text + "</div>",
    });
  }

  private createMarker(latitude: number, longtitude: number, infoWin: google.maps.InfoWindow, value: number, sensor: Sensor): google.maps.Marker {
    var marker: any = new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longtitude),
      map: this.map,
      //animation: google.maps.Animation.DROP,
      icon: this.getColorIcon(value),
      title: value + "dB",
    });

    marker.sensor = sensor;
    marker.isSelected = false;
    
    // defaultni hodnota pro notSelIcon
    marker.pomIconNotSelected = this.getColorIcon(value);
    // defaultni hodnota pro SelIcon
    marker.pomIconSelected = this.getColorIcon(value)
    marker.pomIconSelected.strokeColor = "green";
    marker.pomIconSelected.strokeWeight = 6;
    marker.pomIconSelected.size = 20;
    marker.pomIconSelected.scale = 16;

    marker.addListener('click', () => {
      infoWin.open(this.map, marker);
    });

    marker.addListener('mouseover', () => {
      // marker.setAnimation(google.maps.Animation.BOUNCE);

      marker.setIcon(marker.pomIconSelected)
      this.log.debug(latitude, longtitude)
    });

    marker.addListener('mouseout', () => {
      if (!marker.isSelected) {
        marker.setIcon(marker.pomIconNotSelected)
      }
    });

    this.makers.push(marker);
    return marker;
  }
}