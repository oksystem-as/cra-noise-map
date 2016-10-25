import { BehaviorSubject } from "rxjs/Rx";
import { Observable } from 'rxjs/Observable';
import { GroupedObservable } from 'rxjs/operator/groupBy';
import { Payload, PayloadType } from '../payloads/payload';
import { RxUtils, ObjectUtils } from './utils';
import { Sensor } from '../entity/sensor';
import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import 'rxjs/Rx';

export enum StatisType {
    HOUR,
    DAY6_22,
    DAY18_22,
    NIGHT22_6,
    DAY24,
    WEEK,
    MONTH,
}

export class StatisticUtils {

    public static logSum(data: Sensor, statisType: StatisType): Observable<any>  {
        switch (statisType) {
            case StatisType.HOUR: {
                // log.debug('hodinovy prumer: ');
                return this.resolveLogAverange(RxUtils.groupByHours(ObjectUtils.deepCopyArr(data.payloads)));
            }
            case StatisType.DAY6_22: {
                // log.debug('denni 6-22 prumer: ');
                return this.resolveLogAverange(RxUtils.groupByDay(ObjectUtils.deepCopyArr(data.payloads)));
            }
            case StatisType.DAY18_22: {
                // log.debug('denni 18-22 prumer: ');
                return  this.resolveLogAverange(RxUtils.groupBy18_22(ObjectUtils.deepCopyArr(data.payloads)));
            }
            case StatisType.NIGHT22_6: {
                // log.debug('nocni 22-6 prumer: ');
                return this.resolveLogAverange(RxUtils.groupByNight(ObjectUtils.deepCopyArr(data.payloads)));
            }
            case StatisType.DAY24: {
                // log.debug('denni 24h prumer: ');
                return this.resolveLogAverange(RxUtils.groupByDays(ObjectUtils.deepCopyArr(data.payloads)));
            }
            case StatisType.WEEK: {
                // log.debug('tydeni prumer: ');
                return this.resolveLogAverange(RxUtils.groupByWeek(ObjectUtils.deepCopyArr(data.payloads)));
            }
            case StatisType.MONTH: {
                // log.debug('mesicni prumer: ');
                return this.resolveLogAverange(RxUtils.groupByMonth(ObjectUtils.deepCopyArr(data.payloads)));
            }
            default: throw "nepodporovany graf " + statisType;
        }
    }

    private static resolveLogAverange(groups: Observable<GroupedObservable<number, Payload>>): Observable<any> {
       return groups.map(group => {
            // console.log('group: ', group);

            // uprava value a pridani count
            let powDataStream = group.map((data, idx) => {
                let powValue = Math.pow(10, (this.getValue(data) / 10))
                let powObj = { count: idx + 1, time: data.createdAt, powValue: powValue, sumValue: powValue };
                return powObj;
            });

            // // soucet value
            let sumDataStream = powDataStream.reduce((a, b) => {
                b.sumValue = b.powValue + a.sumValue;
                return b;
            });

            // logaritm. prumer ze souctu a poctu polozek (jen pro danou hodinu)
            let logAvgDataStream = sumDataStream.map((data, idx) => {
                // console.log(' [datax]: ', data);
                let avgObj = { time: data.time, logAverange: 10 * Math.log(data.sumValue / data.count) / Math.log(10) };
                return avgObj;
            })

            // // // zobrazeni a spusteni straemu
           return  logAvgDataStream;
        });
    }

    private static getValue(payload: Payload): number {
        if (payload.payloadType == PayloadType.ARF8084BA) {
            return (payload as ARF8084BAPayload).temp;
        }
        if (payload.payloadType == PayloadType.RHF1S001) {
            return (payload as RHF1S001Payload).teplota;
        }

    }
}