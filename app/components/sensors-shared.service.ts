import { Location } from 'ng2-bootstrap/components/utils/facade/browser';
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

import { CRaService, DeviceDetailParams } from '../service/cra.service';
import { DeviceDetail, Record } from '../entity/device/device-detail';
import { Devices, DeviceRecord } from '../entity/device/devices';
import { Payload, PayloadType } from '../payloads/payload';
import { Sensor } from '../entity/sensor';
import { DateUtils, MonthList } from '../utils/utils';
import { StatisticsUtils, Statistics, Statistic, SensorStatistics, StatisType } from '../utils/statis-utils';

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

export interface IEvent<T> {
    name: string;
}

export class Events {
    public static runAnimation: IEvent<Sensor> = { name: "runAnimation" };
    public static selectSensor: IEvent<SensorStatistics> = { name: "selectSensor" };
    public static sliderNewDate: IEvent<Date> = { name: "sliderNewDate" };
    public static startAnimation: IEvent<Sensor> = { name: "startAnimation" };
    public static mapOverlays: IEvent<OverlayGroup[]> = { name: "mapOverlays" };
    public static statistics: IEvent<SensorStatistics> = { name: "statistics" };
    // public static beforeLoadSensors: IEvent<string> = { name: "beforeLoadSensors" };
    public static loadSensors: IEvent<Observable<SensorStatistics>> = { name: "loadSensors" };
    public static loadSensor: IEvent<SensorStatistics> = { name: "loadSensor" };
    public static mapInstance: IEvent<google.maps.Map> = { name: "mapInstance" };
    public static showMasterLoading: IEvent<boolean> = { name: "showMaterLoading" };
    public static statisSlider: IEvent<{statisType: StatisType, startDate : Date, endDate: Date}> = { name: "statisSlider" };
    // public static chartPointSelected: IEvent<google.maps.Map> = { name: "chartPointSelected" };
}

export class AggregatorEvent<T> {
    type: IEvent<T>;
    data: T;
    publisher: any;
}

@Injectable()
export class SensorsSharedService {
    // POZOR mesic je o jedna nizsi
    // http://stackoverflow.com/questions/1453043/zero-based-month-numbering 
    public static minDateLimit = new Date(2016, MonthList.Cervenec, 18);
    private eventAggregator: Subject<AggregatorEvent<any>> = new Subject<AggregatorEvent<any>>();

    // ------------ TEST DATA ------------
    private baseNoise = 30;
    private aRF8084BAPayloadResolver = new ARF8084BAPayloadResolver();
    private rHF1S001PayloadResolver = new RHF1S001PayloadResolver();
    private location: { devEUI: string, latitude: number, name: string, longtitude: number, latitudeText: string, longtitudeText: string}[] = [
        { devEUI: "0004A30B0019D0EA", name: "Náměstí bratří synků", latitude: 50.064227, longtitude: 14.441406, latitudeText: "50°03'51.2\"", longtitudeText: "14°26'29.1\""},
        { devEUI: "0018B20000000336", name: "OKsystem            ", latitude: 50.052853, longtitude: 14.439492, latitudeText: "50°03'10.3\"", longtitudeText: "14°29'22.2\"" },
        { devEUI: "0018B20000000165", name: "Kongresové centrum  ", latitude: 50.062028, longtitude: 14.428990, latitudeText: "50°04'10.3\"", longtitudeText: "14°28'22.2\"" },
        { devEUI: "0018B2000000016E", name: "Třebotovská         ", latitude: 50.039161, longtitude: 14.389049, latitudeText: "50°02'10.3\"", longtitudeText: "14°25'22.2\"" },
        { devEUI: "0018B20000000337", name: "Trhanovské náměstí  ", latitude: 50.051616, longtitude: 14.525933, latitudeText: "50°05'10.3\"", longtitudeText: "14°20'22.2\"" },
        { devEUI: "0018B2000000033C", name: "Světovova           ", latitude: 50.105831, longtitude: 14.474953, latitudeText: "50°03'10.3\"", longtitudeText: "14°23'22.2\"" },
        { devEUI: "0018B2000000033A", name: "U Roztockého háje   ", latitude: 50.142034, longtitude: 14.391308, latitudeText: "50°04'10.3\"", longtitudeText: "14°22'22.2\"" },
        { devEUI: "0018B20000000339", name: "K točné             ", latitude: 49.966399, longtitude: 14.442805, latitudeText: "50°08'10.3\"", longtitudeText: "14°21'22.2\"" },
        { devEUI: "0018B20000000335", name: "Na petynce          ", latitude: 50.089150, longtitude: 14.377480, latitudeText: "50°09'10.3\"", longtitudeText: "14°27'22.2\"" },
    ]

    // private location: { devEUI: string, name: string,  latitude: number, longtitude: number, latitudeText: string, longtitudeText: string }[] = [{
    //     devEUI: "0004A30B0019D0EA", name: "Náměstí bratří synků", latitude: 50.064227, longtitude: 14.441406, latitudeText: "50°03'51.2\"N", longtitudeText: "14°26'29.1\"E",
    // }]

    private deviceList = ["0004A30B0019D0EA", "0018B20000000165", "0018B20000000336", "0018B2000000016E", "0018B20000000337", "0018B2000000033C", "0018B2000000033A", "0018B20000000339", "0018B20000000335",]
    // private deviceList = ["0004A30B0019D0EA"];
    private deviceType = PayloadType.ARF8084BA;
    // ------------ TEST DATA ------------

    constructor(private log: Logger, private craService: CRaService) {
        // zobrazeni informaci z event aggregatoru
        this.eventAggregator.subscribe((data) => {
            log.debug("[Event published] type: [", data.type, "], publisher: [", data.publisher, "] data: ", data.data);
        });

        // propojeni nacteni vsech senzoru a publish nacteni jednoho sensoru (na oboji je mozne si zaregistrovat posluchace)
        this.listenEventData(Events.loadSensors).subscribe(eventsList => {
            // console.log("Events.loadSensors obs: ", eventsList);
            eventsList.subscribe(eventa => {
                // console.log("Events.loadSensors sensor: ", eventa);
                this.publishEvent(Events.loadSensor, eventa, "SensorsSharedService.loadSensors");
            });
        });
    }

    /**
     * provede vyvolani udalosti [type] a preda data [data] vsem posluchaum na tuto [type] eventu
     */
    publishEvent<T>(type: IEvent<T>, data: T, publisher: any = "[not defined]") {
        this.eventAggregator.next({ type: type, data: data, publisher: publisher });
    }

    /**
     * prida posluchace na konkretni eventu viz class Events
     * - da moznost zaregistrovat subscribe, ktery dostane jako eventu primo data 
     */
    listenEventData<T>(type: IEvent<T>): Observable<T> {
        return this.eventAggregator.filter((data) => { return data.type === type }).pluck('data') as Observable<T>;
    }

    /**
     * prida posluchace na konkretni eventu viz class Events
     * - da moznost zaregistrovat subscribe, ktery dostane jako eventu AggregatorEvent<T>
     */
    listenEvent<T>(type: IEvent<T>): Observable<AggregatorEvent<T>> {
        return this.eventAggregator.filter((data) => { return data.type === type });
    }

    /**
     * provede ukonceni streamu (POZOR vsichni posluchaci se ukonci a neni mozne posilat nove eventy)
     */
    disposeEventsAggregator() {
        this.eventAggregator.complete();
    }

    /**
     * vytvori novy stream (POZOR je potreba vsechny posluchace opet zaregistrovat)
     */
    createEventsAggregator() {
        this.eventAggregator = new Subject<AggregatorEvent<any>>();
    }

    /**
     * nacte sensory
     * default date je aktulani datum
     */
    loadSensorsAndPublish(date?: Date) {
        console.log("SensorsSharedService.loadSensors()", date);
        let dateInt = date;
        if(!dateInt){
            dateInt = DateUtils.getDayFlatDate(new Date())
        }
        this.publishEvent(Events.loadSensors, this.loadSensors(dateInt, this.deviceList), "SensorsSharedService.loadSensors");
    }

    loadStatisticsData(deviceDetailParams?: DeviceDetailParams) {
        this.log.debug("SensorsSharedService.loadStatisticsData() ");

        this.loadSensorNew(deviceDetailParams)
            .filter(data => {
                return data != undefined && data.statistics != undefined 
            }).subscribe(statistics => {
                this.publishEvent(Events.statistics, statistics);
            });
    }

    // private loadSensorsWithDefaultParam(deviceDetailParams?: DeviceDetailParams): Observable<Sensor> {
    //     let devicedetailParamsList: DeviceDetailParams[] = [];
    //     let deviceDetailParamsInter = deviceDetailParams;
    //     this.deviceList.forEach(element => {
    //         let deviceDetailParams;
    //         if (deviceDetailParamsInter != undefined) {
    //             devicedetailParamsList.push(<DeviceDetailParams>{
    //                 start: deviceDetailParamsInter.start,
    //                 stop: deviceDetailParamsInter.stop,
    //                 limit: deviceDetailParamsInter.limit,
    //                 order: deviceDetailParamsInter.order,
    //                 devEUI: element,
    //                 payloadType: this.deviceType,
    //                 offset: deviceDetailParamsInter.offset
    //             });
    //         } else {
    //             devicedetailParamsList.push(<DeviceDetailParams>{
    //                 start: SensorsSharedService.minDateLimit,
    //                 limit: 1,
    //                 order: Order.asc,
    //                 devEUI: element,
    //                 payloadType: this.deviceType,
    //             });
    //         }
    //     });

    //     return this.loadSensors(devicedetailParamsList);
    // }

    private loadSensors(date: Date, devEUI: string[]): Observable<any> {
        this.log.debug("SensorsSharedService.loadSensors()", date, devEUI);

        let list = [];
        devEUI.forEach(devEUI => {
            let param = new DeviceDetailParams();
            param.devEUI = devEUI;
            param.date = date;
            list.push(this.loadSensorNew(param));
        });

        return Observable.merge.apply(this, list)
    }

    // private loadSensor(devicedetailParams: DeviceDetailParams): Observable<Sensor> {
    //     // this.log.debug("SensorsSharedService.loadSensor()", devicedetailParams);
    //     return this.craService.getDeviceDetail(devicedetailParams)
    //         .filter(response => {
    //             return response != undefined && response.records != undefined && response.records instanceof Array
    //         })
    //         .map((response, idx) => {
    //             // this.log.debug("SensorsSharedService.loadSensor() response: ", response);
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
    //             // this.log.debug("behaviorSubject ", sensor)
    //             return sensor;
    //         })
    // }

    private loadSensorNew(devicedetailParams: DeviceDetailParams): Observable<SensorStatistics> {
        // this.log.debug("SensorsSharedService.loadSensor()", devicedetailParams);
        return this.craService.getDeviceDetailNew(devicedetailParams)
            .filter(response => {
                return response != undefined && response.statistics != undefined && response.statistics instanceof Array
            }).map((response, idx) => {
                //console.log("loadSensorNew", response);
                this.addLocationAndDate(response);
                return response;
            })
    }

    private addLocationAndDate(sensorStatistics: SensorStatistics) {
        this.location.forEach(location => {
            if(location.devEUI === sensorStatistics.devEUI){
                sensorStatistics.name = location.name;
                sensorStatistics.latitude = location.latitude;
                sensorStatistics.latitudeText = location.latitudeText;
                sensorStatistics.longtitude = location.longtitude;
                sensorStatistics.longtitudeText = location.longtitudeText;
            } 
        })

        sensorStatistics.statistics.forEach(statis =>{
            statis.avgValues.forEach(value => {
                value.date = DateUtils.parseDate(value.date);
            })
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

    // private reslovePayload(payloadType: PayloadType, payload: String, sensor: Sensor): Payload {
    //     if (payloadType == PayloadType.ARF8084BA) {
    //         // this.log.debug("je to ARF8084BA " + payload)
    //         let payloadint = this.aRF8084BAPayloadResolver.resolve(payload);
    //         // fake data 
    //         this.listLocationSensor.forEach(element => {
    //             if (element.devEUI === sensor.devEUI) {
    //                 payloadint.latitude = element.latitude;
    //                 payloadint.longtitude = element.longtitude;
    //                 payloadint.latitudeText = element.longtitudeText;
    //                 payloadint.longtitudeText = element.latitudeText;
    //                 payloadint.temp = Math.floor(((Math.random() * 100)));
    //                 payloadint.status.GPSInfoIsPresent = true;
    //                 sensor.name = element.name;
    //                 // console.log(Math.floor(Math.sin(element.index++ / 30) * 10));
    //                 // element.noise += Math.floor(Math.sin(element.index++ / 30) * 10)
    //                 // element.noise = Math.floor(element.noise);
    //                 // console.log(element.noise, this.listLocationSensor);
    //                 // console.log(Math.floor(((Math.random() * 10) / 2))); ((Math.random() * 10) / 2)
    //                 // if (element.noise > 80 && element.noise > 40) {

    //                 // } else {
    //                 // element.noise += Math.floor(((Math.random() * 10) / 2));
    //                 // }

    //                 // if (Math.round(((Math.random()))) == 0) {
    //                 //     payloadint.status.GPSInfoIsPresent = false;
    //                 //       payloadint.latitude = null;
    //                 //     payloadint.longtitude = element.longtitude;
    //                 // } else {
    //                 //     payloadint.status.GPSInfoIsPresent = true;
    //                 //     payloadint.latitude = element.latitude;
    //                 //     payloadint.longtitude = element.longtitude;
    //                 //     // console.log(Math.floor(Math.sin(element.index++ / 30) * 10));
    //                 //     // element.noise += Math.floor(Math.sin(element.index++ / 30) * 10)
    //                 // }
    //                 // payloadint.temp = Math.floor(((Math.random() * 100)));

    //             }
    //         });


    //         return payloadint;
    //     }

    //     if (payloadType == PayloadType.RHF1S001) {
    //         // this.log.debug("je to RHF1S001 " + payload)
    //         let payloadint = this.rHF1S001PayloadResolver.resolve(payload);
    //         return payloadint
    //     }
    //     return null;
    // }

}