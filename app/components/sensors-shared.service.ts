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
import { DateUtils } from '../utils/utils';

export class Overlay {
    checked: boolean;
    value: number;
    text: string;
    position: number;
}

@Injectable()
export class SensorsSharedService {

    private minDateLimit = new Date(2016, 7, 18);
    private sensors: BehaviorSubject<Sensor[]> = new BehaviorSubject([]);
    private animationSensor: BehaviorSubject<Sensor> = new BehaviorSubject(null);
    private statisticsData: BehaviorSubject<Sensor> = new BehaviorSubject(null);
    private minDate: BehaviorSubject<Date> = new BehaviorSubject(this.minDateLimit);
    private overlays: BehaviorSubject<Overlay[]> = new BehaviorSubject(null);

    private selectedSensor: BehaviorSubject<Sensor> = new BehaviorSubject(null);

    private deviceList = ["0018B20000000165", "0018B20000000336", "0018B2000000016E", "0018B20000000337", "0018B2000000033C", "0018B2000000033A", "0018B20000000339", "0018B20000000335",]
    // private deviceList = ["0018B20000000165"];
    private deviceType = PayloadType.ARF8084BA;

    private devicedetailParamsDefault = <DeviceDetailParams>{
        start: this.minDateLimit,
        limit: 20,
        order: Order.asc
    }

    constructor(private log: Logger, private craService: CRaService) {
        this.loadInitialData(this.devicedetailParamsDefault, this.sensors, true);
    }

    getAnimationSensor(): Observable<Sensor> {
        this.log.debug("SensorsSharedService.getAnimationSensor()");
        return this.animationSensor.asObservable();
    }

    setAnimationSensor(sensor: Sensor) {
        this.log.debug("SensorsSharedService.setAnimationSensor()", sensor);
        this.animationSensor.next(sensor);
    }
    
    getSelectedSensor(): Observable<Sensor> {
        this.log.debug("SensorsSharedService.getSelectedSensor()");
        return this.selectedSensor.asObservable();
    }

    setSelectedSensor(sensor: Sensor) {
        this.log.debug("SensorsSharedService.setSelectedSensor()", sensor);
        this.selectedSensor.next(sensor);
    }

    getOverlays(): Observable<Overlay[]> {
        this.log.debug("SensorsSharedService.getOverlays()");
        return this.overlays.asObservable();
    }

    setOverlays(overlays: Overlay[]) {
        this.log.debug("SensorsSharedService.setOverlays()", overlays);
        this.overlays.next(overlays);
    }

    getStatisticsData(): Observable<Sensor> {
        this.log.debug("SensorsSharedService.getStatisticsData()");
        return this.statisticsData.asObservable();
    }

    loadStatisticsData(devicedetailParams: DeviceDetailParams) {
        this.log.debug("SensorsSharedService.loadStatisticsData() ", devicedetailParams);
        this.loadDeviceDetails(devicedetailParams, this.statisticsData);
    }

    getSensors(): Observable<Sensor[]> {
        this.log.debug("SensorsSharedService.getGps()");
        return this.sensors.asObservable();
    }


    getMinDate(): Observable<Date> {
        this.log.debug("SensorsSharedService.getMinDate()");
        return this.minDate.asObservable();
    }


    loadSensor(params: DeviceDetailParams): void {
        this.log.debug("SensorsSharedService.loadGps()");
        this.loadInitialData(params, this.sensors, false);
    }

    public loadInitialData(devicedetailParams: DeviceDetailParams, behaviorSubject: BehaviorSubject<any>, resolveMinDate: boolean) {
        this.log.debug("SensorsSharedService.loadInitialData(). Params: ", devicedetailParams);
        this.setDeviceDetails(devicedetailParams, behaviorSubject);
    }

    // nacte payloady zarizeni dle zadanych parametru - momentalne napsane primo na gps cidla
    private loadDeviceDetails(devicedetailParams: DeviceDetailParams, behaviorSubject: BehaviorSubject<any>) {
        
        this.craService.getDeviceDetail(devicedetailParams).subscribe(response => {

            if (response && response.records && response.records instanceof Array) {
                var sensor = new Sensor();
                sensor.devEUI = response.devEUI;
                sensor.payloadType = response.payloadType;
                sensor.publisher = response.publisher;
                response.records.forEach(record => {
                    // let payload: ARF8084BAPayload = aRF8084BAPayloadResolver.resolve(record.payloadHex)
                    let payload = this.reslovePayload(devicedetailParams.payloadType, record.payloadHex)
                    payload.createdAt = DateUtils.parseDate(record.createdAt);
                    console.log(record.createdAt, payload.createdAt)
                    payload.payloadType = response.payloadType;
                    sensor.payloads.push(payload);
                })
                this.log.debug("behaviorSubject ", sensor)
                behaviorSubject.next(sensor);
                // behaviorSubject.complete();
            }
        })

    }

    // nacte payloady zarizeni dle zadanych parametru - momentalne napsane primo na gps cidla
    private setDeviceDetails(devicedetailParams: DeviceDetailParams, behaviorSubject: BehaviorSubject<any>) {
        var promises = [];
        this.deviceList.forEach(device => {
            devicedetailParams.devEUI = device;
            devicedetailParams.payloadType = this.deviceType;
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
                    sensor.publisher = response.publisher;
                    response.records.forEach((record: Record) => {
                        let payload = this.reslovePayload(this.deviceType, record.payloadHex);
                        payload.createdAt = DateUtils.parseDate(record.createdAt);
                        payload.payloadType = response.payloadType;
                        sensor.payloads.push(payload);
                    })
                    list.push(sensor);
                }
            })
            this.log.debug("done2", list);
            behaviorSubject.next(list);
        })
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
}