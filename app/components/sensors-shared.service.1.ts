import { Injectable, OnInit } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from "rxjs/Rx";
import { Observable } from "rxjs/Observable";

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { ARF8084BAPayloadResolver } from '../payloads/ARF8084BAPayloadResolver';

import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { RHF1S001PayloadResolver } from '../payloads/RHF1S001PayloadResolver';

import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../service/cra.service';
import { DeviceDetail, Record } from '../entity/device/device-detail';
import { Devices, DeviceRecord } from '../entity/device/devices';
import { Payload, PayloadType } from '../payloads/payload';
import { Sensor } from '../entity/sensor';

@Injectable()
export class SensorsSharedService {

    private oldDate = new Date(2014,1,1);

    private sensors: BehaviorSubject<Sensor[]> = new BehaviorSubject([]);
    private statisticsData: BehaviorSubject<Sensor> = new BehaviorSubject(null);
    private minDate: BehaviorSubject<Date> = new BehaviorSubject(this.oldDate);

    private devicedetailParamsDefault = <DeviceDetailParams>{
        start: new Date(2016,9,15),
        limit: 10,
        order: Order.asc
    }

    private deviceGpsParams = <DeviceParams>{
        projectName: 'GPSinCars'
    };

    constructor(private log: Logger, private craService: CRaService) {
        this.loadInitialData(this.devicedetailParamsDefault, this.deviceGpsParams, this.sensors, true);
    }

    getStatisticsData(): Observable<Sensor> {
        this.log.debug("SensorsSharedService.getStatisticsData()");
        return this.statisticsData.asObservable();
    }

    loadStatisticsData(devicedetailParams: DeviceDetailParams) {
        this.log.debug("SensorsSharedService.loadStatisticsData() ", devicedetailParams);
        this.loadDeviceDetails(devicedetailParams, this.statisticsData);
    }

    getSensor(): Observable<Sensor[]> {
        this.log.debug("SensorsSharedService.getGps()");
        return this.sensors.asObservable();
    }


    getMinDate(): Observable<Date> {
        this.log.debug("SensorsSharedService.getMinDate()");
        return this.minDate.asObservable();
    }


    loadSensor(params: DeviceDetailParams): void {
        this.log.debug("SensorsSharedService.loadGps()");
        this.loadInitialData(params, this.deviceGpsParams, this.sensors, false);
    }

    public loadInitialData(devicedetailParams: DeviceDetailParams, deviceParams: DeviceParams, behaviorSubject: BehaviorSubject<any>, resolveMinDate: boolean) {
        this.log.debug("SensorsSharedService.loadInitialData(). Params: " + devicedetailParams);

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
                this.setDeviceDetails(response, devicedetailParams, behaviorSubject);
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
            Observable.forkJoin(promises).subscribe(result => {
                var minDate = new Date();

                result.forEach((response: DeviceDetail) => {
                    if (response && response.records && response.records instanceof Array) {
                        response.records.forEach(record => {
                            this.log.debug(record.createdAt + " " + record.devEUI)
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
    private loadDeviceDetails(devicedetailParams: DeviceDetailParams, behaviorSubject: BehaviorSubject<any>) {
        this.craService.getDeviceDetail(devicedetailParams).subscribe(response => {
            if (response && response.records && response.records instanceof Array) {
                var sensor = new Sensor();
                sensor.devEUI = response.devEUI;
                sensor.payloadType = response.payloadType;
                response.records.forEach(record => {
                    // let payload: ARF8084BAPayload = aRF8084BAPayloadResolver.resolve(record.payloadHex)
                    let payload = this.reslovePayload(devicedetailParams.payloadType, record.payloadHex)
                    payload.createdAt = new Date(record.createdAt);
                    payload.payloadType = response.payloadType;
                    sensor.payloads.push(payload);
                })
                this.log.debug("behaviorSubject ", sensor)
                behaviorSubject.next(sensor);
            }
        })

    }

    // nacte payloady zarizeni dle zadanych parametru - momentalne napsane primo na gps cidla
    private setDeviceDetails(responseDev: Devices, devicedetailParams: DeviceDetailParams, behaviorSubject: BehaviorSubject<any>) {
        // let device  = new Devices(this.log);
        // device.records = [];
        // let aRF8084BAPayloadResolver = new ARF8084BAPayloadResolver();
        // this.log.debug("done3", gps);
        var promises = [];
        if (responseDev && responseDev.records && responseDev.records instanceof Array) {
            responseDev.records.forEach(device => {
                devicedetailParams.devEUI = device.devEUI;
                devicedetailParams.payloadType = this.getPayloadType(device)
                var promise = this.craService.getDeviceDetail(devicedetailParams);
                promises.push(promise);
            })
            Observable.forkJoin(promises).subscribe(result => {
                var list = [];

                result.forEach((response: DeviceDetail) => {
                    if (response && response.records && response.records instanceof Array) {
                        let sensor = new Sensor();
                        sensor.devEUI = response.devEUI;
                        sensor.payloadType = response.payloadType;
                        response.records.forEach((record: Record) => {
                            // let payload: ARF8084BAPayload = aRF8084BAPayloadResolver.resolve(record.payloadHex)
                            let payload = this.findAndReslovePayload(responseDev, record.devEUI, record.payloadHex)
                            payload.createdAt = new Date(record.createdAt);
                            payload.payloadType = response.payloadType;
                            sensor.payloads.push(payload);
                        })
                        list.push(sensor);
                    }
                })
                this.log.debug("done2", list);
                // this.gps.next(list);
                behaviorSubject.next(list);
            })
        }
    }

    private getPayloadType(deviceRecord: DeviceRecord) {
        if (deviceRecord.model == "ARF8084BA") {
            return PayloadType.ARF8084BA;
        }
        if (deviceRecord.model == "RHF1S001") {
            return PayloadType.RHF1S001;
        }
    }

    private reslovePayload(payloadType: PayloadType, payload: String): Payload {
        let aRF8084BAPayloadResolver = new ARF8084BAPayloadResolver();
        let rHF1S001PayloadResolver = new RHF1S001PayloadResolver();

        if (payloadType == PayloadType.ARF8084BA) {
            // this.log.debug("je to ARF8084BA " + payload)
            let payloadint = aRF8084BAPayloadResolver.resolve(payload);
            // fake data 
            payloadint.temp = Math.floor(Math.random() * 100) + 1
            return payloadint;
        }

        if (payloadType == PayloadType.RHF1S001) {
            // this.log.debug("je to RHF1S001 " + payload)
            let payloadint = rHF1S001PayloadResolver.resolve(payload);
            return payloadint
        }
        return null;
    }

    private findAndReslovePayload(devices: Devices, devEUI: string, payload: string): Payload {
        for (var index = 0; index < devices.records.length; index++) {
            var device = devices.records[index];
            if (device.devEUI === devEUI) {
                if (device.model == "ARF8084BA") {
                    return this.reslovePayload(PayloadType.ARF8084BA, payload);
                }
                if (device.model == "RHF1S001") {
                    return this.reslovePayload(PayloadType.RHF1S001, payload);
                }
            }
        }

        return null;
    }
}