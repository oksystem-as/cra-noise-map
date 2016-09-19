import { Injectable, OnInit } from '@angular/core';
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

@Injectable()
export class SensorsSharedService {

    private oldDate = new Date("2014-01-01");
    private gps: BehaviorSubject<ARF8084BAPayload[]> = new BehaviorSubject([]);
    private temp: BehaviorSubject<RHF1S001Payload[]> = new BehaviorSubject([]);
    private minDate: BehaviorSubject<Date> = new BehaviorSubject(this.oldDate);

    constructor(private craService: CRaService) {
        let devicedetailParamsDefault = <DeviceDetailParams>{
            start: new Date("2016-09-15"),
            limit: 10,
            order: Order.asc
        }

        this.loadInitialData(devicedetailParamsDefault);
        console.log("loadInitialData called ");
    }

    getGps(): Observable<ARF8084BAPayload[]> {
        console.log("PersonSharedService.getGps()");
        return this.gps.asObservable();
    }

    getTemp(): Observable<RHF1S001Payload[]> {
        console.log("PersonSharedService.getSelectedPerson()");
        return this.temp.asObservable();
    }

    getMinDate(): Observable<Date> {
        console.log("PersonSharedService.getSelectedPerson()");
        return this.minDate.asObservable();
    }

    loadGps(params: DeviceDetailParams): void {
        console.log("PersonSharedService.getGps()");
        this.loadInitialData (params);
    }

    public loadInitialData(devicedetailParams: DeviceDetailParams) {
        console.log("PersonSharedService.loadInitialData()");

        // Rx.Observable.merge(
        //       myService.upload('upload1'),
        //       myService.upload('upload2').subscribe({complete: () => { ... });
        //    Observable.merge(
        //   myService.upload('upload2').subscribe({complete: () => { ... });
        //Promise.all()
        let deviceParams = <DeviceParams>{
            projectName: 'GPSinCars'
        };

        let devicedetailParamsMinDate = <DeviceDetailParams>{
            start: this.oldDate,
            limit: 1,
            order: Order.asc
        }

        this.craService.getDevices(deviceParams).subscribe(
            response => {
                this.setMinDate(response, devicedetailParamsMinDate);
                this.setDeviceDetails(response, devicedetailParams);
            },
            e => console.log('onError: %s', e),
            () => console.log('onCompleted'));
    }

    private setMinDate(response: Devices, devicedetailParams: DeviceDetailParams) {
        var promises = [];
        if (response && response.records && response.records instanceof Array) {
            response.records.forEach(device => {
                devicedetailParams.devEUI=device.devEUI;
                var promise = this.craService.getDeviceDetail(devicedetailParams);
                promises.push(promise);
            })
            Promise.all(promises).then(result => {
                var minDate = new Date();

                result.forEach(response => {
                    if (response && response.records && response.records instanceof Array) {
                        response.records.forEach(record => {
                            // console.log(record.createdAt + " " + record.devEUI )
                            let dateInt = new Date(record.createdAt);
                            if (minDate.getTime() > dateInt.getTime()) {
                                minDate = dateInt;
                            }
                        })
                    }
                })
                console.log( "min " + minDate.toLocaleString() )
                this.minDate.next(minDate);
            })
        }
    }

     private setDeviceDetails(response: Devices, devicedetailParams: DeviceDetailParams) {
        let aRF8084BAPayloadResolver = new ARF8084BAPayloadResolver();
        // console.log("done3", gps);
        var promises = [];
        if (response && response.records && response.records instanceof Array) {
            response.records.forEach(device => {
                devicedetailParams.devEUI=device.devEUI;
                var promise = this.craService.getDeviceDetail(devicedetailParams);
                promises.push(promise);
            })
            Promise.all(promises).then(result => {
                var list = [];

                result.forEach(response => {
                    if (response && response.records && response.records instanceof Array) {
                        response.records.forEach(record => {
                            list.push(aRF8084BAPayloadResolver.resolve(record.payloadHex));
                        })
                    }
                })
                // console.log("done2", result);
                this.gps.next(list);
            })
        }
    }
}