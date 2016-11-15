import { Component, ViewEncapsulation, AfterViewInit, ViewChild } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { Observable } from "rxjs/Observable";
import { Scheduler } from "rxjs/Scheduler";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
//import '../../node_modules/google-maps/lib/Google.js';
// import { CRaService } from '../service/cra.service';
// import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
// import { RHF1S001PayloadResolver } from '../payloads/RHF1S001PayloadResolver';
// import { DeviceDetail } from '../entity/device/detail/device-detail';.
import { Sensor } from '../entity/sensor';
import { Payload, PayloadType } from '../payloads/payload';
import { SensorsSharedService, Overlay, Events, OverlayGroup } from './sensors-shared.service';
import { CRaService, DeviceDetailParams, Order } from '../service/cra.service';
import { SensorStatistics, Statistic, Statistics, StatisticsUtils, StatisType } from '../utils/statis-utils';
import { ResponsiveState } from 'ng2-responsive';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { ObjectUtils, ColorUtils, DateUtils } from '../utils/utils';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements AfterViewInit {
  // private height = "92vh"; land ios
  // private height = "94vh"; potr ios
  private mapId = "map"
  public map: google.maps.Map;
  private markersMap: Map<string, any> = new Map<string, any>();
  private currCenter;
  private overlayGroup: OverlayGroup[];
  private noiseMapType: google.maps.ImageMapType;
  private sliderNewDate: Date = new Date();
  // private showLoading = false;
  private selectedSensor: SensorStatistics;
  private isMobileIntrenal: boolean;
  // private isPortraitInternal: boolean;

  constructor(private log: Logger, private sensorsSharedService: SensorsSharedService, responsiveState: ResponsiveState) {
    if (log != undefined) {
      this.log.debug("responsiveState: ", responsiveState);
    }

    responsiveState.deviceObserver.subscribe(device => {
      this.isMobileIntrenal = device === "mobile";
    });

    // responsiveState.orientationObserver.subscribe(orientation => {
    //   this.isPortraitInternal = orientation === "portrait";
    //   log.debug("zmena orientace: ", orientation);
    //   if (this.map != undefined) {
    //     this.calculateCenter();
    //   }
    // });
  }

  isMobile() {
    if (this.isMobileIntrenal == undefined) {
      throw "isMobileIntrenal neni definovan";
    }
    return this.isMobileIntrenal;
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.initNoiseOverlay();
    this.initControlsLayout()
    this.addNewDataListener();
    this.sensorsSharedService.loadSensorsAndPublish();
    this.centerChangeListener();
    // this.addMapDomListener();
  }

  // ngAfterViewChecked(): void {
  //   this.addMapDomListener();
  // }

  private addMapDomListener() {
    if (this.isMobile()) {
      google.maps.event.addDomListener(this.map, 'idle', function () { //idle
        var controlElement = document.getElementsByClassName("gm-style-mtc") as any;
        controlElement[0].style.top = "79px";
        controlElement[0].style.right = "23px";
        controlElement[0].style.left = null;
        controlElement[0].style.bottom = null;
      });
      google.maps.event.addDomListener(this.map, 'idle', function () {
        var controlGoogleStreet = document.getElementsByClassName("gm-bundled-control-on-bottom") as any;
        controlGoogleStreet[0].style.left = null;
        controlGoogleStreet[0].style.top = null;
        controlGoogleStreet[0].style.right = "28px";
        controlGoogleStreet[0].style.bottom = "93px";
        controlGoogleStreet[0].style.position = "absolute";
      });
    } else {
      google.maps.event.addDomListener(this.map, 'idle', function () {
        var controlElement = document.getElementsByClassName("gm-style-mtc") as any;
        // controlElement[0].classList.remove("bottom");
        // controlElement[0].classList.remove("right");
        controlElement[0].style.left = "0px";
        controlElement[0].style.top = "43px";
        controlElement[0].style.right = null;
        controlElement[0].style.bottom = null;
        controlElement[0].style.height = "30px";
      });
    }
  }


  private initMap() {
    if (this.isMobile()) {
      this.map = new google.maps.Map(document.getElementById(this.mapId), {
        zoom: 12,
        //center: { lat: 50.053942, lng: 14.437404 }, // OKsystem
        center: { lat: 50.064227, lng: 14.441406 }, // nam brat. synk
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        zoomControl: false,
        scaleControl: false,
        streetViewControl: false,
        // streetViewControlOptions: {
        //   position: google.maps.ControlPosition.RIGHT_BOTTOM
        // },
      });
    } else {
      this.map = new google.maps.Map(document.getElementById(this.mapId), {
        zoom: 12,
        //center: { lat: 50.053942, lng: 14.437404 }, // OKsystem
        center: { lat: 50.064227, lng: 14.441406 }, // nam brat. synk
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DEFAULT,
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        }
      });
    }

    this.sensorsSharedService.publishEvent(Events.mapInstance, this.map, "MapComponent.initMap");
  }

  private initNoiseOverlay() {
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

        var unsortedLayers: Overlay[];
        this.overlayGroup.forEach((overlayGroup: OverlayGroup) => {
          // console.log("overlayGroup", overlayGroup);
          if (unsortedLayers != undefined && unsortedLayers.length > 0) {
            unsortedLayers = unsortedLayers.concat(ObjectUtils.deepCopyArr(overlayGroup.overlays));
          } else {
            unsortedLayers = ObjectUtils.deepCopyArr(overlayGroup.overlays);
          }
        });
        var sortedLayers: Overlay[] = unsortedLayers.sort((n1, n2) => n1.position - n2.position);

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
  }

  initControlsLayout() {
    this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(document.getElementById('okSystemLogo'));
    // this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('aboutAppId'));
    // this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('statisticsButtonId'));
    // this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('senzorMenuId'));
    // this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('statisticsId'));

    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('overlaysSearchId'));
    // this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(document.getElementById('baseMapLegendId'));
    // this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById('loadingOnMap'));
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
    this.sensorsSharedService.listenEventData(Events.mapOverlays).debounceTime(1500).filter((overlayGroup: OverlayGroup[]) => {
      return overlayGroup != undefined && overlayGroup.length > 0
    }).subscribe((overlayGroup: OverlayGroup[]) => {
      this.overlayGroup = overlayGroup;
      let checked = false;
      overlayGroup.forEach((overlayGroup: OverlayGroup) => {
        let overlays: Overlay[] = overlayGroup.overlays;

        for (var index = 0; index < overlays.length; index++) {
          if (overlays[index].checked) {
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
    })

    // zvyrazneni vybraneho
    this.sensorsSharedService.listenEventData(Events.selectSensor).subscribe((sensor: SensorStatistics) => {
      // this.markersMap.
      this.markersMap.forEach((marker, key) => {
        // console.log("getSelectedSensor foundc ", key, marker);
        if (key === sensor.devEUI) {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          marker.setIcon(this.decorateAsPermSelected(marker.getIcon()));
          marker.isPermSelected = true;

          setTimeout(() => {
            marker.setAnimation(null);
          }, 500);

          this.selectedSensor = marker.sensor
          var latLng = marker.getPosition(); // returns LatLng object
          this.map.panTo(latLng); // setCenter takes a LatLng object
          // console.log("getSelectedSensor found ", marker);
        } else {
          marker.isPermSelected = false;
          marker.setIcon(this.decorateAsNotSelected(marker.getIcon()));
        }
      });
    });

    this.sensorsSharedService.listenEventData(Events.sliderNewDate).subscribe(date => {
      if (date) {
        this.sliderNewDate = DateUtils.getDayFlatDate(date);
      }
    });

    this.sensorsSharedService.listenEventData(Events.loadSensors).subscribe(() => {
      // pri kazdem reloadu se markery jakoby zresetuji  
      this.markersMap.forEach((marker, key) => {
        marker.setIcon(this.getGrayIcon());
        marker.showData = false;
      });
      return true;
    });

    this.sensorsSharedService.listenEventData(Events.loadSensor).filter((sensor: SensorStatistics) => {
      return sensor != undefined && sensor.statistics != undefined //&& sensor.statistics.length > 0
    }).subscribe((sensor: SensorStatistics) => {
      this.removeMarkers(sensor.devEUI);
      let foundDAY24 = false;
      let selected = false;
      if (this.selectedSensor) {
        selected = this.selectedSensor.devEUI === sensor.devEUI
      }
      sensor.statistics.forEach((statistics: Statistics) => {
        if (statistics.type === StatisType.DAY24) {
          foundDAY24 = true;
          var infowindow = this.createInfoWindow(sensor, statistics.avgValues[0].avgValue, statistics.avgValues[0].date);
          this.createMarker(sensor.latitude, sensor.longtitude, infowindow, statistics.avgValues[0].avgValue, sensor, true, selected);
        }
      });
      if (!foundDAY24) {
        var infowindowNan = this.createInfoWindowNan(sensor, this.sliderNewDate);
        this.createMarker(sensor.latitude, sensor.longtitude, infowindowNan, null, sensor, false, selected);
      }
    });
  }

  private calculateCenter() {
    this.currCenter = this.map.getCenter();
  }

  private setMapCenter() {
    this.map.setCenter(this.currCenter);
  }

  private centerChangeListener() {
    // if (this.map != undefined) {
    //   google.maps.event.addListener(this.map, 'dragend', function () {
    //     if (this.map != undefined && this.map.getCenter != undefined) {
    //       this.calculateCenter();
    //     }
    //   });

    //     google.maps.event.addDomListener(this.map, 'center_changed', function () {
    //       this.currCenter  = this.map.getCenter();
    //     });

    //     google.maps.event.addDomListener(this.map, 'bounds_changed', function () {
    //       if (this.currCenter) {
    //         this.map.setCenter(this.currCenter);
    //     }
    //     this.currCenter = null;
    // });
    // }

    // Add an event listener that calculates center on idle  
    // google.maps.event.addDomListener(this.map, 'idle', () => {
    //    if (this.map != undefined) {
    //    this.calculateCenter();
    //   }
    // });
    // Add an event listener that calculates center on resize  

    // google.maps.event.addDomListener(window, 'resize', () => {
    //   this.setMapCenter();
    // });
  }

  private removeMarkers(devEUI: string) {
    let marker = this.markersMap.get(devEUI);
    if (marker != undefined) {
      marker.setMap(null);
      marker.length = 0;
      this.markersMap.delete(devEUI);
    }
  }

  private createInfoWindow(sensor: SensorStatistics, dayAvgVal: number, date: Date): google.maps.InfoWindow {
    let text =
      "<strong>Čidlo:</strong> " + sensor.name + "<br> " +
      "<strong>Datum měření hluku:</strong> " + date.toLocaleDateString() + "<br> " +
      "<strong><label style=\"padding-top:5px;\">Průměrné hladiny hluku:</label></strong>" +
      " <table class='table table-striped point-statis-table'> " + //class='table table-striped'
      " <thead><tr><th>Období měření</th><th>Hodnota</th></tr></thead>";
    let hour; let day6; let day18; let night; let day24; let week; let month;
    sensor.statistics.forEach(statistics => {
      switch (statistics.type) {
            case StatisType.HOUR: 
              hour = "<tr><th>" + StatisticsUtils.getNameForStatisType(statistics.type) + "</th><td>" + Math.round(statistics.avgValues[0].avgValue) + " dB</td>"; 
              break;
            case StatisType.DAY6_22: 
              day6 = " <tr><th>" + StatisticsUtils.getNameForStatisType(statistics.type) + "</th><td>" + Math.round(statistics.avgValues[0].avgValue) + " dB</td>";
              break;
            case StatisType.DAY18_22: 
              day18 = " <tr><th>" + StatisticsUtils.getNameForStatisType(statistics.type) + "</th><td>" + Math.round(statistics.avgValues[0].avgValue) + " dB</td>";
              break;
            case StatisType.NIGHT22_6: 
              night = " <tr><th>" + StatisticsUtils.getNameForStatisType(statistics.type) + "</th><td>" + Math.round(statistics.avgValues[0].avgValue) + " dB</td>";
              break;
            case StatisType.DAY24: 
              day24 = " <tr style=\"background-color:" + ColorUtils.getColor(Math.round(statistics.avgValues[0].avgValue)) + "\">" +
              "<th style=\"color:" + ColorUtils.getColorText(Math.round(statistics.avgValues[0].avgValue)) + "\">" + StatisticsUtils.getNameForStatisType(statistics.type) + "</th>" +
              "<td style=\"color:" + ColorUtils.getColorText(Math.round(statistics.avgValues[0].avgValue)) + "\">" + Math.round(statistics.avgValues[0].avgValue) + " dB</td>";
              break;
            case StatisType.WEEK: 
              week = " <tr><th>" + (DateUtils.getDateMinusDays(this.sliderNewDate, 7)).toLocaleDateString() + " - " + (DateUtils.getDayFlatDate(this.sliderNewDate)).toLocaleDateString() + "</th><td>" + Math.round(statistics.avgValues[0].avgValue) + " dB</td>";
              break;
            case StatisType.MONTH: 
              month = " <tr><th>" + (DateUtils.getDateMinusDays(this.sliderNewDate, 30)).toLocaleDateString() + " - " + (DateUtils.getDayFlatDate(this.sliderNewDate)).toLocaleDateString() + "</th><td>" + Math.round(statistics.avgValues[0].avgValue) + " dB</td>";
              break;
        }
    })
    if (hour)  text += hour; 
    if (day6)  text += day6; 
    if (day18) text += day18; 
    if (night) text += night; 
    if (day24) text += day24; 
    if (week)  text += week; 
    if (month) text += month; 

    return new google.maps.InfoWindow({
      content: "<div class='info-window'>" + 
                text +
                "</table>" +
                "<p style=\"font-size: 10px;\">" +
                  "Tip: Kliknutím na čidlo se zobrazí detailní statistiky." +
                "</p>" +
                "</div>",
      disableAutoPan: true,
      // zIndex: 10000000,
      // pixelOffset: new google.maps.Size(200,200,"px","px"),
      //position: { lat: sensor.latitude+400, lng: sensor.longtitude },
    });
  }

  private createInfoWindowNan(sensor: SensorStatistics, date: Date): google.maps.InfoWindow {
    let text = "<strong>Čidlo:</strong> " + sensor.name + " <br>" +
      "<strong>Datum měření hluku:</strong> " + date.toLocaleDateString() + "<br> " +
      "<strong>Aktuální hodnota hluku (24H):</strong> -- <br> <br>" +
      "Pro vybraný den nejsou data úplná.";
    let tip = "Tip: Kliknutím na čidlo se zobrazí detailní statistiky."
    return new google.maps.InfoWindow({
      content: "<div class='info-window'>" + 
                text + 
                "<br><br><p style=\"font-size: 10px;\">" + tip +"</p>" +
                "</div>",
      disableAutoPan: true,
    });
  }

  private createMarker(latitude: number, longtitude: number, infoWin: google.maps.InfoWindow, value: number, sensor: SensorStatistics, showData: boolean, selecteSensor: boolean): google.maps.Marker {
    var marker: any = new google.maps.Marker({
      position: new google.maps.LatLng(latitude, longtitude),
      map: this.map,
      //animation: google.maps.Animation.DROP,
      icon: showData ? this.getColorIcon(value) : this.getGrayIcon(),
      // icon: this.getColorIcon(value),
      // title: value + "dB",
    });

    marker.sensor = sensor;
    marker.isPermSelected = selecteSensor;
    marker.showData = showData //sensor.showData;

    marker.addListener('mousedown', () => {
      this.sensorsSharedService.publishEvent(Events.showMasterLoading, true, "MapComponent.markerClick");
      this.selectedSensor = marker.sensor
      this.map.panTo(marker.getPosition()); // setCenter takes a LatLng object

      // marker.setAnimation(google.maps.Animation.BOUNCE);
      marker.setIcon(this.decorateAsPermSelected(marker.getIcon()));
      marker.isPermSelected = true;

      // setTimeout(() => {
      //   marker.setAnimation(null);
      // }, 500);

      // setTimeout(() => {
      this.sensorsSharedService.publishEvent(Events.selectSensor, marker.sensor, "MapComponent.markerClick");
      setTimeout(() => {
        this.sensorsSharedService.loadStatisticsData(<DeviceDetailParams>{ devEUI: marker.sensor.devEUI });
      }, 500);
    });

    marker.addListener('mouseover', () => {
      marker.setIcon(this.decorateAsSelected(marker.getIcon()));
      // setTimeout(() => {
      // if (marker.showData) {
      infoWin.open(this.map, marker);
      // }
      // }, 2000);

    });

    marker.addListener('mouseout', () => {
      marker.setIcon(this.decorateAsNotSelectedPerm(marker.getIcon(), marker.isPermSelected));
      // if (marker.showData) {
      // setTimeout(() => {
      infoWin.close();
      // }, 2000);
      // }
    });

    if (selecteSensor) {
      marker.setIcon(this.decorateAsNotSelectedPerm(marker.getIcon(), true));
    }

    this.markersMap.set(sensor.devEUI, marker);
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
      fillColor: ColorUtils.getColor(Math.round(value)),
      fillOpacity: 0.8,
      strokeWeight: 2,
    };
  }

  private getGrayIcon() {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      strokeColor: '#444',
      fillColor: "gray",
      fillOpacity: 0.8,
      strokeWeight: 2,
    };
  }
}