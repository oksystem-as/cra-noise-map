import { StatisticsComponent } from './statistics/statistics.component';
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
import { DateUtils, MonthList } from '../utils/utils';


export class OverlayGroup {
    overlays: Overlay[];
    name: string;
}

export class Overlay {
    checked: boolean;
    value: number;
    text: string;
    position: number;
}


export interface Eventa<T> {
}

export class Eventy {
    public static runAnimation: Eventa<Observable<Sensor>>;
}
export enum Events {
    runAnimation = <any>"runAnimation",
    selectSensor = <any>"selectSensor",
    sliderNewDate = <any>"sliderNewDate",
    startAnimation = <any>"startAnimation",
    mapOverlays = <any>"mapOverlays",
    statistics = <any>"statistics",
    beforeLoadSensors = <any>"beforeLoadSensors",
    loadSensors = <any>"loadSensors",
}

export class Event2<T> {
    type: Eventa<T>;
    data: T;
    publisher: any;
}

export class Event {
    type: Events;
    data: any;
    publisher: any;
}

@Injectable()
export class SensorsSharedService {
    // POZOR mesic je o jedna
    // http://stackoverflow.com/questions/1453043/zero-based-month-numbering 
    public static minDateLimit = new Date(2016, MonthList.Cervenec, 18);
    private sensors: BehaviorSubject<Sensor[]> = new BehaviorSubject([]);
    // private animationSensor: BehaviorSubject<Sensor> = new BehaviorSubject(null);
    // private statisticsData: BehaviorSubject<Sensor> = new BehaviorSubject(null);
    // private minDate: BehaviorSubject<Date> = new BehaviorSubject(SensorsSharedService.minDateLimit);
    // private overlays: BehaviorSubject<OverlayGroup[]> = new BehaviorSubject(null);

    // private selectedSensor: BehaviorSubject<Sensor> = new BehaviorSubject(null);

    private eventAggregator: Subject<Event> = new Subject<Event>();
    private eventAggregator2: Subject<Event2<any>> = new Subject<Event2<any>>();

    private deviceList = ["0018B20000000165", "0018B20000000336", "0018B2000000016E", "0018B20000000337", "0018B2000000033C", "0018B2000000033A", "0018B20000000339", "0018B20000000335",]
    // private deviceList = ["0018B20000000165"];
    private deviceType = PayloadType.ARF8084BA;

    private devicedetailParamsDefault = <DeviceDetailParams>{
        start: SensorsSharedService.minDateLimit,
        limit: 1,
        order: Order.asc
    }

    constructor(private log: Logger, private craService: CRaService) {
        // this.loadInitialData(this.devicedetailParamsDefault, this.sensors, true);
        // this.publishEvent(Events.loadSensors, this.loadSensorsDefault());
        this.eventAggregator2.subscribe((data) => {
            log.debug("[Event2 published] type: [" + data.type + "], publisher: [" + data.publisher + "] data: ", data.data);
        });

        this.eventAggregator.subscribe((data) => {
            log.debug("[Event published] type: [" + data.type + "], publisher: [" + data.publisher + "] data: ", data.data);
        });

        // this.eventAggregator.subscribe((data) => {
        //     data.data.subscribe(eventa => {
        //         console.log("eventa  ", eventa);
        //     });
        // });
        
        // this.listenEventData(Events.runAnimation).subscribe(eventa => {
        //     console.log("eventa  ", eventa);
        //     eventa.subscribe(eventa => {
        //         console.log("eventa2  ", eventa);
        //     });
        // });

        // this.publishEvent(Events.runAnimation, this.loadSensorsDefault());

        this.listenEvent2(Eventy.runAnimation).subscribe(eventa => {
            console.log("eventa  " , eventa);
        });
         this.listenEvent2Data(Eventy.runAnimation).subscribe(sensor => {
            console.log("Sensor2  " , Sensor);
        });

        this.publishEvent2(Eventy.runAnimation, this.loadSensorsDefault());
     

    }

    publishEvent(type: Events, data: any, publisher: any = "[not defined]") {
        this.eventAggregator.next({ type: type, data: data, publisher: publisher });
    }

    publishEvent2<T>(type: Eventa<T>, data: T, publisher: any = "[not defined]") {
        this.eventAggregator2.next({ type: type, data: data, publisher: publisher });
    }

    listenEventData(type: Events): Observable<any> {
        return this.eventAggregator.filter((data) => { return data.type === type }).pluck('data');
    }

    listenEvent2Data<T>(type: Eventa<T>): Observable<T> {
        return this.eventAggregator2.filter((data) => { return data.type === type }).pluck('data') as Observable<T>;
    }

    listenEvent2<T>(type: Eventa<T>): Observable<Eventa<T>> {
        return this.eventAggregator2.filter((data) => { return data.type === type });
    }

    listenEvent(type: Events): Observable<Event> {
        return this.eventAggregator.filter((data) => { return data.type === type });
    }

    disposeEvents() {
        this.eventAggregator.complete();
    }


    // getAnimationSensor(): Observable<Sensor> {
    //     this.log.debug("SensorsSharedService.getAnimationSensor()");
    //     return this.animationSensor.asObservable();
    // }

    // setAnimationSensor(sensor: Sensor) {
    //     this.log.debug("SensorsSharedService.setAnimationSensor()", sensor);
    //     this.animationSensor.next(sensor);
    // }

    // getSelectedSensor(): Observable<Sensor> {
    //     this.log.debug("SensorsSharedService.getSelectedSensor()");
    //     return this.selectedSensor.asObservable();
    // }

    // setSelectedSensor(sensor: Sensor) {
    //     this.log.debug("SensorsSharedService.setSelectedSensor()", sensor);
    //     this.selectedSensor.next(sensor);
    // }

    // getOverlays(): Observable<OverlayGroup[]> {
    //     this.log.debug("SensorsSharedService.getOverlays()");
    //     return this.overlays.asObservable();
    // }

    // setOverlays(overlays: OverlayGroup[]) {
    //     this.log.debug("SensorsSharedService.setOverlays()", overlays);
    //     this.overlays.next(overlays);
    // }

    // getStatisticsData(): Observable<Sensor> {
    //     this.log.debug("SensorsSharedService.getStatisticsData()");
    //     return this.statisticsData.asObservable();
    // }

    loadStatisticsData(devicedetailParams: DeviceDetailParams) {
        this.log.debug("SensorsSharedService.loadStatisticsData() ", devicedetailParams);
        this.loadSensor2(devicedetailParams).subscribe(sensor => {
            this.publishEvent(Events.statistics, sensor);
        });
    }

    loadSensorsDefault(): Observable<Sensor> {
        let devicedetailParamsList: DeviceDetailParams[] = [];
        this.deviceList.forEach(element => {
            let deviceDetailParams: DeviceDetailParams = <DeviceDetailParams>{
                start: SensorsSharedService.minDateLimit,
                limit: 1,
                order: Order.asc,
                devEUI: element,
                payloadType: this.deviceType,
            }
            devicedetailParamsList.push(deviceDetailParams);
        });

        return this.loadSensors(devicedetailParamsList);
    }

    loadSensors(devicedetailParamsList: DeviceDetailParams[]): Observable<Sensor> {
        this.log.debug("SensorsSharedService.loadSensors()", devicedetailParamsList);
        let obs: Observable<Sensor>;
        // devicedetailParamsList.forEach(devicedetailParams => {
        //     if (obs != undefined) {
        //         obs.merge(this.loadSensor2(devicedetailParams))
        //     } else {
        obs = this.loadSensor2(devicedetailParamsList[0]);
        //     }
        // });
        // Observable.merge(
        return obs;
    }

    loadSensor2(devicedetailParams: DeviceDetailParams): Observable<Sensor> {
        this.log.debug("SensorsSharedService.loadSensor2()", devicedetailParams);
        return this.craService.getDeviceDetail(devicedetailParams)
            .filter(response => {
                this.log.debug("SensorsSharedService.loadSensor2() response1> ", response);
                return response != undefined && response.records != undefined && response.records instanceof Array
            })
            .map((response, idx) => {
                this.log.debug("SensorsSharedService.loadSensor2() response2> ", response);
                var sensor = new Sensor();
                sensor.devEUI = response.devEUI;
                sensor.payloadType = response.payloadType;
                sensor.publisher = response.publisher;
                response.records.forEach(record => {
                    // let payload: ARF8084BAPayload = aRF8084BAPayloadResolver.resolve(record.payloadHex)
                    let payload = this.reslovePayload(devicedetailParams.payloadType, record.payloadHex, sensor)
                    payload.createdAt = DateUtils.parseDate(record.createdAt);
                    payload.payloadType = response.payloadType;
                    sensor.payloads.push(payload);
                })
                this.log.debug("behaviorSubject ", sensor)
                return sensor;
            })

    }

    getSensors(): Observable<Sensor[]> {
        this.log.debug("SensorsSharedService.getGps()");
        return this.sensors.asObservable();
    }


    // getMinDate(): Observable<Date> {
    //     this.log.debug("SensorsSharedService.getMinDate()");
    //     return this.minDate.asObservable();
    // }


    loadSensor(params: DeviceDetailParams): void {
        this.log.debug("SensorsSharedService.loadGps()");
        this.loadInitialData(params, this.sensors, false);
    }

    public loadInitialData(devicedetailParams: DeviceDetailParams, behaviorSubject: BehaviorSubject<any>, resolveMinDate: boolean) {
        this.log.debug("SensorsSharedService.loadInitialData(). Params: ", devicedetailParams);
        this.setDeviceDetails(devicedetailParams, behaviorSubject);
    }

    // // nacte payloady zarizeni dle zadanych parametru - momentalne napsane primo na gps cidla
    // private loadDeviceDetails(devicedetailParams: DeviceDetailParams): Observable<Sensor> {
    //     return this.craService.getDeviceDetail(devicedetailParams)
    //         .filter(response => { return response && response.records && response.records instanceof Array })
    //         .map((response, idx) => {
    //             var sensor = new Sensor();
    //             sensor.devEUI = response.devEUI;
    //             sensor.payloadType = response.payloadType;
    //             sensor.publisher = response.publisher;
    //             response.records.forEach(record => {
    //                 // let payload: ARF8084BAPayload = aRF8084BAPayloadResolver.resolve(record.payloadHex)
    //                 let payload = this.reslovePayload(devicedetailParams.payloadType, record.payloadHex, sensor)
    //                 payload.createdAt = DateUtils.parseDate(record.createdAt);
    //                 payload.payloadType = response.payloadType;
    //                 sensor.payloads.push(payload);
    //             })
    //             this.log.debug("behaviorSubject ", sensor)
    //             return sensor;
    //         })
    // }

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
                        let payload = this.reslovePayload(this.deviceType, record.payloadHex, sensor);
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

    private reslovePayload(payloadType: PayloadType, payload: String, sensor: Sensor): Payload {
        if (payloadType == PayloadType.ARF8084BA) {
            // this.log.debug("je to ARF8084BA " + payload)
            let payloadint = this.aRF8084BAPayloadResolver.resolve(payload);
            // fake data 
            this.listLocationSensor.forEach(element => {
                if (element.devEUI === sensor.devEUI) {
                    payloadint.latitude = element.latitude;
                    payloadint.longtitude = element.longtitude;
                    payloadint.latitudeText = element.longtitudeText;
                    payloadint.longtitudeText = element.latitudeText;
                    payloadint.temp = Math.floor(((Math.random() * 100)));
                    payloadint.status.GPSInfoIsPresent = true;
                    sensor.name = element.name;
                    // console.log(Math.floor(Math.sin(element.index++ / 30) * 10));
                    // element.noise += Math.floor(Math.sin(element.index++ / 30) * 10)
                    // element.noise = Math.floor(element.noise);
                    // console.log(element.noise, this.listLocationSensor);
                    // console.log(Math.floor(((Math.random() * 10) / 2))); ((Math.random() * 10) / 2)
                    // if (element.noise > 80 && element.noise > 40) {

                    // } else {
                    // element.noise += Math.floor(((Math.random() * 10) / 2));
                    // }

                    // if (Math.round(((Math.random()))) == 0) {
                    //     payloadint.status.GPSInfoIsPresent = false;
                    //       payloadint.latitude = null;
                    //     payloadint.longtitude = element.longtitude;
                    // } else {
                    //     payloadint.status.GPSInfoIsPresent = true;
                    //     payloadint.latitude = element.latitude;
                    //     payloadint.longtitude = element.longtitude;
                    //     // console.log(Math.floor(Math.sin(element.index++ / 30) * 10));
                    //     // element.noise += Math.floor(Math.sin(element.index++ / 30) * 10)
                    // }
                    // payloadint.temp = Math.floor(((Math.random() * 100)));

                }
            });


            return payloadint;
        }

        if (payloadType == PayloadType.RHF1S001) {
            // this.log.debug("je to RHF1S001 " + payload)
            let payloadint = this.rHF1S001PayloadResolver.resolve(payload);
            return payloadint
        }
        return null;
    }

    private baseNoise = 30;
    private aRF8084BAPayloadResolver = new ARF8084BAPayloadResolver();
    private rHF1S001PayloadResolver = new RHF1S001PayloadResolver();
    private listLocationSensor: { devEUI: string, latitude: number, name: string, longtitude: number, latitudeText: string, longtitudeText: string, noise: number, index: number }[] = [
        { devEUI: "0018B20000000336", name: "OKsystem           ", latitude: 50.052853, longtitude: 14.439492, latitudeText: "50°03'10.3\"", longtitudeText: "14°29'22.2\"", noise: this.baseNoise, index: 10 },
        { devEUI: "0018B20000000165", name: "Kongresové centrum ", latitude: 50.062028, longtitude: 14.428990, latitudeText: "50°04'10.3\"", longtitudeText: "14°28'22.2\"", noise: this.baseNoise, index: 2 },
        { devEUI: "0018B2000000016E", name: "Třebotovksá        ", latitude: 50.039161, longtitude: 14.389049, latitudeText: "50°02'10.3\"", longtitudeText: "14°25'22.2\"", noise: this.baseNoise, index: 20 },
        { devEUI: "0018B20000000337", name: "Trhanovské naměstí ", latitude: 50.051616, longtitude: 14.525933, latitudeText: "50°05'10.3\"", longtitudeText: "14°20'22.2\"", noise: this.baseNoise, index: 7 },
        { devEUI: "0018B2000000033C", name: "Světovova          ", latitude: 50.105831, longtitude: 14.474953, latitudeText: "50°03'10.3\"", longtitudeText: "14°23'22.2\"", noise: this.baseNoise, index: 3 },
        { devEUI: "0018B2000000033A", name: "U Roztockého háje  ", latitude: 50.142034, longtitude: 14.391308, latitudeText: "50°04'10.3\"", longtitudeText: "14°22'22.2\"", noise: this.baseNoise, index: 10 },
        { devEUI: "0018B20000000339", name: "K točné            ", latitude: 49.966399, longtitude: 14.442805, latitudeText: "50°08'10.3\"", longtitudeText: "14°21'22.2\"", noise: this.baseNoise, index: 4 },
        { devEUI: "0018B20000000335", name: "Na petynce         ", latitude: 50.089150, longtitude: 14.377480, latitudeText: "50°09'10.3\"", longtitudeText: "14°27'22.2\"", noise: this.baseNoise, index: 4 },
    ]
}