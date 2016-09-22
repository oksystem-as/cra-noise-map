import { Injectable, OnInit } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { Subject }    from 'rxjs/Subject';
import { BehaviorSubject } from "rxjs/Rx";
import { Observable } from "rxjs/Observable";

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { ARF8084BAPayloadResolver } from '../payloads/ARF8084BAPayloadResolver';

import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { RHF1S001PayloadResolver } from '../payloads/RHF1S001PayloadResolver';

import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../service/cra.service';
import { DeviceDetail } from '../entity/device/device-detail';
import { Devices } from '../entity/device/devices';
import { Payload } from '../payloads/payload';
import { Sensor } from '../entity/sensor';

@Injectable()
export class SensorsSharedService {

    private oldDate = new Date("2014-01-01");

    private sensors: BehaviorSubject<Sensor[]> = new BehaviorSubject([]);

    private gps: BehaviorSubject<ARF8084BAPayload[]> = new BehaviorSubject([]);
    private temp: BehaviorSubject<RHF1S001Payload[]> = new BehaviorSubject([]);
    private minDate: BehaviorSubject<Date> = new BehaviorSubject(this.oldDate);
    // private selectedDate: BehaviorSubject<number> = new BehaviorSubject(null);

    private devicedetailParamsDefault = <DeviceDetailParams>{
        start: new Date("2016-09-15"),
        limit: 10,
        order: Order.asc
    }

    private deviceGpsParams = <DeviceParams>{
        projectName: 'GPSinCars'
    };

    constructor(private log: Logger, private craService: CRaService) {
        this.loadInitialData(this.devicedetailParamsDefault, this.deviceGpsParams, true);
    }

    getGps(): Observable<ARF8084BAPayload[]> {
        this.log.debug("SensorsSharedService.getGps()");
        return this.gps.asObservable();
    }

    getTemp(): Observable<RHF1S001Payload[]> {
        this.log.debug("SensorsSharedService.getTemp()");
        return this.temp.asObservable();
    }

    getMinDate(): Observable<Date> {
        this.log.debug("SensorsSharedService.getMinDate()");
        return this.minDate.asObservable();
    }

    // getSelectedDate(): Observable<number> {
    //     this.log.debug("SensorsSharedService.getSelectedDate()");
    //     return this.selectedDate.asObservable();
    // }

    // setSelectedDate(datenumber: number): void {
    //     this.log.debug("SensorsSharedService.setSelectedDate() " + datenumber);
    //     return this.selectedDate.next(datenumber);
    // }

    loadGps(params: DeviceDetailParams): void {
        this.log.debug("SensorsSharedService.loadGps()");
        this.loadInitialData(params, this.deviceGpsParams, false);
    }

    public loadInitialData(devicedetailParams: DeviceDetailParams, deviceParams: DeviceParams, resolveMinDate: boolean) {
        this.log.debug("SensorsSharedService.loadInitialData(). Params: " + devicedetailParams);

        // Rx.Observable.merge(
        //       myService.upload('upload1'),
        //       myService.upload('upload2').subscribe({complete: () => { ... });
        //    Observable.merge(
        //   myService.upload('upload2').subscribe({complete: () => { ... });
        //Promise.all()


        let devicedetailParamsMinDate = <DeviceDetailParams>{
            start: this.oldDate,
            limit: 1,
            order: Order.asc
        }

        this.craService.getDevices(deviceParams).subscribe(
            response => {
                if (resolveMinDate) {
                    this.setMinDate(response, devicedetailParamsMinDate);
                }
                this.setDeviceDetails(response, devicedetailParams);
            });
        // ,
        // e => this.log.debug('SensorsSharedService.onError: %s', e),
        // () => this.log.debug('SensorsSharedService.onCompleted'));
    }

    // vybere nejnizsi datum, od ktereho prisel prvni respone - nutne je na zacatku 
    private setMinDate(response: Devices, devicedetailParams: DeviceDetailParams) {
        var promises = [];
        if (response && response.records && response.records instanceof Array) {
            response.records.forEach(device => {
                devicedetailParams.devEUI = device.devEUI;
                var promise = this.craService.getDeviceDetail(devicedetailParams);
                promises.push(promise);
            })
            Promise.all(promises).then(result => {
                var minDate = new Date();

                result.forEach(response => {
                    if (response && response.records && response.records instanceof Array) {
                        response.records.forEach(record => {
                            // this.log.debug(record.createdAt + " " + record.devEUI )
                            let dateInt = new Date(record.createdAt);
                            if (minDate.getTime() > dateInt.getTime()) {
                                minDate = dateInt;
                            }
                        })
                    }
                })
                this.log.debug("min " + minDate.toLocaleString())
                this.minDate.next(minDate);
            })
        }
    }

    // nacte payloady zarizeni dle zadanych parametru - momentalne napsane primo na gps cidla
    private setDeviceDetails(responseDev: Devices, devicedetailParams: DeviceDetailParams) {
        // let device  = new Devices(this.log);
        // device.records = [];
        // let aRF8084BAPayloadResolver = new ARF8084BAPayloadResolver();
        // this.log.debug("done3", gps);
        var promises = [];
        if (responseDev && responseDev.records && responseDev.records instanceof Array) {
            responseDev.records.forEach(device => {
                devicedetailParams.devEUI = device.devEUI;
                var promise = this.craService.getDeviceDetail(devicedetailParams);
                promises.push(promise);
            })
            Promise.all(promises).then(result => {
                var list = [];

                result.forEach(response => {
                    if (response && response.records && response.records instanceof Array) {
                        response.records.forEach(record => {
                            // let payload: ARF8084BAPayload = aRF8084BAPayloadResolver.resolve(record.payloadHex)
                            let payload = this.reslovePayload(responseDev, record.devEUI, record.payloadHex);
                            list.push(payload);
                        })
                    }
                })
                this.log.debug("done2", list);
                this.gps.next(list);
                // this.sensors.next(list);
            })
        }
    }

    private reslovePayload(devices: Devices, devEUI: string, payload: string): Payload {
        let aRF8084BAPayloadResolver = new ARF8084BAPayloadResolver();
        let rHF1S001PayloadResolver = new RHF1S001PayloadResolver();

        for (var index = 0; index < devices.records.length; index++) {
            var device = devices.records[index];
            if (device.devEUI === devEUI) {
                if (device.model == "ARF8084BA") { 
                    this.log.debug("je to ARF8084BA " + payload)
                    let payloadint = aRF8084BAPayloadResolver.resolve(payload);
                    // fake data 
                    payloadint.temp = Math.floor(Math.random() * 100) + 1
                    return payloadint;
                }  
                if (device.model == "RHF1S001") {
                    this.log.debug("je to RHF1S001 " + payload)
                    return rHF1S001PayloadResolver.resolve(payload);
                }
            }
        }

        return null;
    }
}