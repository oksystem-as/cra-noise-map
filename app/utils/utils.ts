import { BehaviorSubject } from "rxjs/Rx";
import { Observable } from 'rxjs/Observable';
import { GroupedObservable } from 'rxjs/operator/groupBy';
import { Payload, PayloadType } from '../payloads/payload';
import 'rxjs/Rx';

export class RandomUtils {
    private static rdmNum = [];

    public static getRandom(): number {
        let rdm = Math.floor((Math.random() * 1000000) + 1);
        if (this.rdmNum.indexOf(rdm) != -1) {
            return RandomUtils.getRandom();
        } else {
            this.rdmNum.push(rdm);
            return rdm;
        }
    }
}

export class BitUtils {
    static flagbit1: number = 1;    // 2^^0    000...00000001
    static flagbit2: number = 2;    // 2^^1    000...00000010
    static flagbit3: number = 4;    // 2^^2    000...00000100
    static flagbit4: number = 8;    // 2^^3    000...00001000
    static flagbit5: number = 16;   // 2^^4    000...00010000
    static flagbit6: number = 32;   // 2^^5    000...00100000
    static flagbit7: number = 64;   // 2^^6    000...01000000
    static flagbit8: number = 128;  // 2^^7    000...10000000

    static flagbits: number[] = [BitUtils.flagbit1, BitUtils.flagbit2, BitUtils.flagbit3, BitUtils.flagbit4, BitUtils.flagbit5, BitUtils.flagbit6, BitUtils.flagbit7, BitUtils.flagbit8];

    static isBitOn(vstup: number, position: number): boolean {
        // if(vstup > 256){
        //     throw new IllegalArgumentException("Vstup musi byt max 1byte - 8bite. Vstup="+vstup); 
        // }
        // if(position > 7){
        //     throw new IllegalArgumentException("Position musi byt 0 - 7. Position="+position); 
        // }

        let num = this.flagbits[position];
        return (vstup & num) === num;
    }
}

export class DateUtils {
    public static getWeek(date: Date) {
        var onejan = new Date(date.getFullYear(), 0, 1);
        return Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    };

    public static isDay(date: Date): boolean {
        return 6 <= date.getHours() && date.getHours() < 22
    }

    public static isHours18_22(date: Date): boolean {
        return 18 <= date.getHours() && date.getHours() < 22
    }

    public static get18_22FlatDate(date: Date): Date {
        date.setHours(18);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date
    }

    public static getDayNightFlatDate(date: Date): Date {
        if (DateUtils.isDay(date)) {
            date.setHours(6);
        } else {
            date.setHours(22);
        }
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date
    }

    public static getHourFlatDate(date: Date): Date {
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date
    }

    public static getDayFlatDate(date: Date): Date {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    public static getWeekFlatDate(date: Date): Date {
        var startOfWeek = date.getDate() - date.getDay() + 1;
        date.setDate(startOfWeek);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    public static getMonthFlatDate(date: Date): Date {
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }


    public static getyearFlatDate(date: Date): Date {
        date.setMonth(1);
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }
}

export class ObjectUtils {

    public static deepCopyArr(array: any[]): any[] {
        var out = [];
        for (var i = 0, len = array.length; i < len; i++) {
            var item = array[i];
            var obj = {};
            for (var k in item) {
                obj[k] = ObjectUtils.deepCopy(item[k], null);
            }
            out.push(obj);
        }
        return out;
    }

    public static deepCopy(from, to) {
        // console.log(from, to);
        if (from == null || typeof from != "object") {
            // console.log("prvni");
            return from;
        }
        if (!(from instanceof Object) || !(from instanceof Array)) {
            // console.log("druhy");
            return from;
        }
        if (from instanceof Date) {
            return new Date(from);
        }
        // TODO i ostani objekty
        if (from instanceof Date || from instanceof RegExp || from instanceof Function ||
            from instanceof String || from instanceof Number || from instanceof Boolean) {
            throw "Ne vsechny objekty momentalne umim klonovat ... :( ) objekt: " + from;
            // return this.newInstance(from, from);
        }

        // console.log("ctvrty - ", from);

        to = to || Object.create(from);

        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? ObjectUtils.deepCopy(from[name], null) : to[name];
        }

        return to;
    }
}

export class RxUtils {
    public static groupByHours(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).groupBy(
            data => {
                return DateUtils.getHourFlatDate(data.createdAt).getTime()
            },
            data => {
                data.createdAt = DateUtils.getHourFlatDate(data.createdAt);
                return data;
            });
        return source;
    }

    public static groupByDays(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).groupBy(
            data => {
                return DateUtils.getDayFlatDate(data.createdAt).getTime()
            },
            data => {
                data.createdAt = DateUtils.getDayFlatDate(data.createdAt);
                return data;
            });
        return source;
    }

    public static groupByMonth(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).groupBy(
            data => {
                return DateUtils.getMonthFlatDate(data.createdAt).getTime()
            },
            data => {
                data.createdAt = DateUtils.getMonthFlatDate(data.createdAt);
                return data;
            });
        return source;
    }

    public static groupByWeek(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).groupBy(
            data => {
                return DateUtils.getWeekFlatDate(data.createdAt).getTime()
            },
            data => {
                data.createdAt = DateUtils.getWeekFlatDate(data.createdAt);
                return data;
            });
        return source;
    }

    public static groupByDay(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).filter(data => {
            return DateUtils.isDay(data.createdAt)
        }).groupBy(
            data => {
                return DateUtils.getDayNightFlatDate(data.createdAt).getTime()
            },
            data => {
                data.createdAt = DateUtils.getDayNightFlatDate(data.createdAt);
                return data;
            });
        return source;
    }

    public static groupByNight(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).filter(data => {
            return !DateUtils.isDay(data.createdAt)
        }).groupBy(
            data => {
                return DateUtils.getDayNightFlatDate(data.createdAt).getTime()
            },
            data => {
                data.createdAt = DateUtils.getDayNightFlatDate(data.createdAt);
                return data;
            });
        return source;
    }

    public static groupBy18_22(data: Payload[]): Observable<GroupedObservable<number, Payload>> {
        var source = Observable.from(data).filter(data => {
            return DateUtils.isHours18_22(data.createdAt)
        }).groupBy(
            data => {
                return DateUtils.get18_22FlatDate(data.createdAt).getTime()
            },
            data => {
                data.createdAt = DateUtils.get18_22FlatDate(data.createdAt);
                return data;
            });
        return source;
    }
}
