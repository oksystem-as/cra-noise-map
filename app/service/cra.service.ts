import { Injectable } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { DeviceDetail } from '../entity/device/device-detail';
import { Devices } from '../entity/device/devices';

import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { BehaviorSubject } from "rxjs/Rx";
import { Observable } from "rxjs/Observable";
import { Payload, PayloadType } from '../payloads/payload';

@Injectable()
export class CRaService {
  // sklada se: kde jsem + /api pro proxy middleware a pote url na CRa
  // private gpsSensorsUrl = window.location.href + 'api' + '/device/get/GPSinCars?token=kBPIDfNdSfk8fkATerBa6ct6yshdPbOX&limit=10'
  // private personsUrl = window.location.href + 'api' + '/message/get/4786E6ED00350042?token=kBPIDfNdSfk8fkATerBa6ct6yshdPbOX&limit=10'
  // private restProxy = "http://hndocker.oksystem.local:58080/"
  private restProxy = "http://10.0.1.59:58080/"
  private devApiPrefix = 'api/'
  private deviceBaseUrl = 'device/get/'
  private deviceDetailBaseUrl = 'message/get/'
  private token = "kBPIDfNdSfk8fkATerBa6ct6yshdPbOX";
  
  constructor(private log: Logger, private http: Http) { }

  getDevices(params: DeviceParams): Observable<Devices> {
    this.log.debug("PersonService.getDevices()");
    return this.http.get(this.getDeviceUrl(params)). 
      map(response => {
        this.log.debug("PersonService.getDevices() return ", response.json());
        return response.json() as Devices
      })
      .catch(this.handleErrorObservable);
  }

  getDeviceDetail(params: DeviceDetailParams): Observable<DeviceDetail> {
    var devEUI = params.devEUI;
    var payloadType =  params.payloadType;
    var publisher = params.publisher;
    this.log.debug("CRaService.getDeviceDetail() init. ", params);
    return this.http.get(this.getDevicDetailUrl(params)).
       map(response => {
        this.log.debug("CRaService.getDeviceDetail() return ", response.json());
        let deviceDetail = response.json() as DeviceDetail
        deviceDetail.payloadType = payloadType;
        deviceDetail.devEUI = devEUI;
        deviceDetail.publisher = publisher;
        return deviceDetail
      })
      .catch(this.handleErrorObservable);
  }

  private getDevicDetailUrl(params: DeviceDetailParams): string {
    // let url = window.location.href + this.devApiPrefix + this.deviceDetailBaseUrl + params.devEUI + '?token=' + this.token;
    let url = this.restProxy + this.deviceDetailBaseUrl + params.devEUI + '?token=' + this.token;

    if (params.limit) {
      url += '&limit=' + params.limit;
    }

    if (params.offset) {
      url += '&offset=' + params.offset;
    }

    if (params.order) {
      url += '&order=' + params.order;
    }

    if (params.start) {
      url += '&start=' + this.dateToString(params.start);
    }

    if (params.stop) {
      url += '&stop=' + this.dateToString(params.stop);
    }
    this.log.debug("CRaService.getDevicDetailUrl() " + url)
    return url
  }

  private getDeviceUrl(params: DeviceParams): string {
    let url = this.restProxy + this.deviceBaseUrl + params.projectName + '?token=' + this.token;

    if (params.limit) {
      url += '&limit=' + params.limit;
    }

    if (params.offset) {
      url += '&offset=' + params.offset;
    }
    this.log.debug("device url " + url)
    return url
  }

  private handleErrorObservable(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  private handleErrorPromise(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  private dateToString(d: Date): string {
    // start=2016-01-01T01:50:50
    var datestring = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)
      + "T" + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
    return datestring;
  }
}

export class DeviceParams {
  //Slouží k autorizaci requestu a je unikátní pro každý soutěžní team. Pro jeho vygenerování kontaktujte ČRa.
  //token: string;
  projectName: string;

  //Omezení počtu vypsaných záznamů. Hodnota musí být přirozeným číslem (1,2,3…N).
  limit: number;

  //Posunutí prvního vypsaného záznamu o N záznamů. Hodnota musí být nezáporné celé číslo (0,1,2,3…N)
  offset: number
}

export enum Order {
  desc = <any>"desc",
  asc = <any>"asc",
}

export class DeviceDetailParams {
  // kdo zapricinil nacteni - napr pro reload jen pro konkretni graf
  publisher: string;
  
  payloadType: PayloadType;

  devEUI: string;

  //Omezení počtu vypsaných záznamů. Hodnota musí být přirozeným číslem (1,2,3…N).
  limit: number;

  //Posunutí prvního vypsaného záznamu o N záznamů. Hodnota musí být nezáporné celé číslo (0,1,2,3…N)
  offset: number

  //Řazení záznamů dle časového razítka. Povolené hodnoty jsou asc nebo desc
  order: Order;

  // Omezení výpisu zpráv od konkrétního data. Formát 2016-01-01T01:50:50. Zprávy jsou ukládány v časovém pásmu Europe/Prague.
  start: Date

  // Omezení výpisu zpráv do konkrétního data. Formát 2016-01-01T01:50:50. Zprávy jsou ukládány v časovém pásmu Europe/Prague.
  stop: Date

}