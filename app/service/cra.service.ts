import { Injectable } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { DeviceDetail } from '../entity/device/device-detail';
import { Devices } from '../entity/device/devices';
import { SensorStatistics } from '../utils/statis-utils';

import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { BehaviorSubject } from "rxjs/Rx";
import { Observable } from "rxjs/Observable";
import { Payload, PayloadType } from '../payloads/payload';
import { Config } from '../config';

@Injectable()
export class CRaService {
  private restProxy = Config.serverURL + ":" + Config.serverPort + "/"  
  private useServerProxy = Config.useServerProxy;
  // pokud URL obsahuje na zacatku api/ presmeruje se na serveru url jinam
  private useServerApiProxy = Config.useServerProxy;
  private statisUrl = Config.statisURL;
  private serverApiProxy = "api/";

  constructor(private log: Logger, private http: Http) { }

  getDeviceDetailNew(params: DeviceDetailParams): Observable<SensorStatistics> {
    // var devEUI = params.devEUI;
    // var payloadType =  params.payloadType;
    // var publisher = params.publisher;
    // this.log.debug("CRaService.getDeviceDetail() init. ", params);
    return this.http.get(this.getDevicDetailUrlNew(params)).
      map(response => {
        // this.log.debug("CRaService.getDeviceDetail() return ", response.json());
        let deviceDetail = response.json() as SensorStatistics
        // deviceDetail.devEUI = devEUI;
        // deviceDetail.publisher = publisher;
        return deviceDetail
      })
      .catch(this.handleErrorObservable);
  }

  private getDevicDetailUrlNew(params: DeviceDetailParams): string {
    let url;
   
    if(this.useServerProxy){
         url = this.restProxy + this.serverApiProxy + this.statisUrl.replace("{devEUI}", params.devEUI);
    } else {
         url = this.restProxy + this.statisUrl.replace("{devEUI}", params.devEUI);
    }
    
    if (params.date) {
      url += '?date=' + this.dateToString(params.date);
    }

    this.log.debug("CRaService.getDevicDetailUrlNew() " + url)
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

export enum Order {
  desc = <any>"desc",
  asc = <any>"asc",
}

export class DeviceDetailParams {
  // kdo zapricinil nacteni - napr pro reload jen pro konkretni graf
  publisher: string;

  payloadType: PayloadType;

  devEUI: string;

  date: Date

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