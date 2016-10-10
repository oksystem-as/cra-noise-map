import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { Observable } from "rxjs/Observable";
import { Scheduler } from "rxjs/scheduler";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
//import '../../node_modules/google-maps/lib/Google.js';
// import { CRaService } from '../service/cra.service';
// import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
// import { RHF1S001PayloadResolver } from '../payloads/RHF1S001PayloadResolver';
// import { DeviceDetail } from '../entity/device/detail/device-detail';.
import { Sensor } from '../entity/sensor';
import { Payload, PayloadType } from '../payloads/payload';
import { SensorsSharedService, Overlay, Events } from './sensors-shared.service';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../service/cra.service';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { ObjectUtils, ColorUtils } from '../utils/utils';

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
  private map: google.maps.Map;
  private heatmap;
  // private makers: google.maps.Marker[] = [];
  private makers: any[] = [];
  private points: Point[] = [];
  private chkbox = false;
  private overlays: { checked: boolean, value: number, text: string, position: number }[];
  private noiseMapType;
  private sliderNewDate: Date = SensorsSharedService.minDateLimit;
  private hour = 3600000;
  private day = 3600000*24;
  // private iconOn = {
  //   path: google.maps.SymbolPath.CIRCLE,
  //   scale: 12,
  //   size: 30,
  //   // strokeColor: '#444',
  //   // fillColor: 'red',
  //   // fillOpacity: 0.8,
  //   strokeWeight: 4,
  //   strokeColor: 'red',
  // };

  // private iconSelected = {
  //   path: google.maps.SymbolPath.CIRCLE,
  //   scale: 12,
  //   size: 30,
  //   strokeColor: '#444',
  //   fillColor: 'orange',
  //   fillOpacity: 0.8,
  //   strokeWeight: 2,
  // };


  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.addNewDataListener();
  }

  private initMap() {
    this.map = new google.maps.Map(document.getElementById(this.mapId), {
      zoom: 10,
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

    this.map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('tabs-map-legend'));
    this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('statistics'));
    this.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(document.getElementById('baseMapLegendVertical'));
    this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(document.getElementById('baseMapLegendHorizontal'));
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
    this.sensorsSharedService.listenEventData(Events.sliderNewDate).subscribe(data => {
      this.sliderNewDate = data;
    });

    this.sensorsSharedService.listenEventData(Events.runAnimation).filter((sensor: Sensor) => {
      return sensor != undefined && sensor.payloads != undefined
    }).subscribe((sensor: Sensor) => {
      console.log("listenEventData ", sensor);
      this.removeMarkers();
      let obs = Observable.from(sensor.payloads)
      // .flatMap((data, idx) => {
      //   console.log("flatMap", data);
      //   return data;
      // })
      // let sch = new  Scheduler('world',
      //     function (scheduler, x) {
      //       console.log('hello ' + x + ' after 5 seconds');
      //     }
      //   );


      obs.subscribe(payload => {
        console.log("AnimationSensor ", payload);
      })
    });

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
      if (this.map.overlayMapTypes.getLength() > 0) {
        this.map.overlayMapTypes.pop();
      }

      if (checked) {
        this.map.overlayMapTypes.push(this.noiseMapType);
      }
    })

    // zvyrazneni vybraneho
    this.sensorsSharedService.listenEventData(Events.selectSensor).subscribe((sensor: Sensor) => {
      this.makers.forEach(marker => {

        if (marker.sensor.devEUI === sensor.devEUI) {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          marker.setIcon(this.decorateAsPermSelected(marker.getIcon()));
          marker.isPermSelected = true;

          setTimeout(() => {
            marker.setAnimation(null);
          }, 500);

          var latLng = marker.getPosition(); // returns LatLng object
          this.map.panTo(latLng); // setCenter takes a LatLng object
          console.log("getSelectedSensor found ", marker);
        } else {
          marker.isPermSelected = false;
          marker.setIcon(this.decorateAsNotSelected(marker.getIcon()));
        }
      });
    });

    this.sensorsSharedService.getSensors().subscribe((sensors: Sensor[]) => {

      // odstranim predchozi markery
      this.removeMarkers();
      this.removeHeatMap();

      var i = 1;
      sensors.forEach(sensor => {
        // if (sensor.payloads[0] != undefined) {
        //   console.log(sensor.payloads[0].createdAt.toLocaleString());
        // }
        if (sensor.payloadType == PayloadType.ARF8084BA) {
          sensor.payloads.forEach((payload: ARF8084BAPayload) => {
            // je v rozmezi hodiny od vybraneho data
  
            let createdAt = payload.createdAt.getTime();
            let min = this.sliderNewDate.getTime();
            let max = this.sliderNewDate.getTime() + this.day;
            let isBetween = min <= createdAt && createdAt < max

            console.log(isBetween, new Date(min).toLocaleString() + " <= " + new Date(createdAt).toLocaleString() + " < " + new Date(max).toLocaleString());

            if (payload.longtitude != undefined && payload.latitude != undefined && isBetween) {
              //this.log.debug("kreslim ", payload.latitude, payload.longtitude);

              var infowindow = this.createInfoWindow(payload, sensor);
              this.createMarker(payload.latitude, payload.longtitude, infowindow, payload.temp, sensor);
              // this.createHeatPoint(payload.latitude, payload.longtitude, payload.temp);
            }
          });
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

  private createInfoWindow(payload: ARF8084BAPayload, sensor: Sensor): google.maps.InfoWindow {
    let text = "<strong>pozice:</strong> " + payload.latitudeText + "N " + payload.longtitudeText + "E<br> " +
      "<strong>hluk:</strong> " + payload.temp + "dB<br> " +
      "<strong>ID:</strong> " + sensor.devEUI;
    return new google.maps.InfoWindow({
      content: "<div class='info-window'>" + text + "</div>",
      disableAutoPan: true,
    });
  }

  private createMarker(latitude: number, longtitude: number, infoWin: google.maps.InfoWindow, value: number, sensor: Sensor): google.maps.Marker {
    var marker: any = new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longtitude),
      map: this.map,
      //animation: google.maps.Animation.DROP,
      icon: this.getColorIcon(value),
      // title: value + "dB",
    });

    marker.sensor = sensor;
    marker.isPermSelected = false;

    marker.addListener('click', () => {
      this.sensorsSharedService.publishEvent(Events.selectSensor, marker.sensor, "MapComponent.markerClick");
      this.devicedetailParamsDefault.devEUI = marker.sensor.devEUI;
      this.devicedetailParamsDefault.payloadType = marker.sensor.payloadType;
      this.devicedetailParamsDefault.publisher = "markerItem"
      this.sensorsSharedService.loadStatisticsData(this.devicedetailParamsDefault);
    });

    marker.addListener('mouseover', () => {
      marker.setIcon(this.decorateAsSelected(marker.getIcon()));
      // setTimeout(() => {
      infoWin.open(this.map, marker);
      // }, 2000);

    });

    marker.addListener('mouseout', () => {
      marker.setIcon(this.decorateAsNotSelectedPerm(marker.getIcon(), marker.isPermSelected));
      infoWin.close();
    });

    this.makers.push(marker);
    return marker;
  }

  // ICON ---------------------------
  private decorateAsPermSelected(icon: google.maps.Symbol): google.maps.Symbol {
    icon.strokeColor = "red";
    icon.strokeWeight = 4;
    icon.scale = 20;
    return icon;
  }

  private decorateAsNotSelectedPerm(icon: google.maps.Symbol, isPermSelected: boolean): google.maps.Symbol {
    if (isPermSelected) {
      return this.decorateAsPermSelected(icon);
    }
    return this.decorateAsNotSelected(icon);

  }

  private decorateAsNotSelected(icon: google.maps.Symbol): google.maps.Symbol {
    icon.path = google.maps.SymbolPath.CIRCLE;
    icon.strokeColor = "#444";
    icon.strokeWeight = 2;
    icon.scale = 12;
    icon.fillOpacity = 0.8;
    return icon;
  }

  private decorateAsSelected(icon: google.maps.Symbol): google.maps.Symbol {
    icon.strokeColor = "black";
    icon.strokeWeight = 4;
    icon.scale = 20;
    return icon;
  }

  private getColorIcon(value: number) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      strokeColor: '#444',
      fillColor: ColorUtils.getColor(value),
      fillOpacity: 0.8,
      strokeWeight: 2,
    };
  }


  private devicedetailParamsDefault = <DeviceDetailParams>{
    start: new Date(2014, 1, 11),
    //stop: new Date("2016-09-22"),
    order: Order.asc,
    //limit:10000
  }
}