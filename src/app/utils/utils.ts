import { BehaviorSubject } from "rxjs/Rx";
import { Observable } from 'rxjs/Observable';
import { GroupedObservable } from 'rxjs/operator/groupBy';
import { Payload, PayloadType } from '../payloads/payload';
import 'rxjs/Rx';


export class URLUtils {
    /**
     * v IE se window.location.origin nevyskytuje
     */
    public static getWindowLocationOrigin() {
        if (!window.location.origin) {
            return window.location.protocol + "//"
                + window.location.hostname
                + (window.location.port ? ':' + window.location.port : '');
        }
        return window.location.origin;
    }
}

export class ArrayUtils {
    /**
     * nahrazeni objektu v listu dle zadaneho predikatu
     */
    public static replaceObject<T>(array: T[], obj: T, predicate: (value: T) => boolean) {
        var ind;
        for (var index = 0; index < array.length; index++) {
            var sensorInt = array[index];
            if (predicate(sensorInt)) {
                ind = index
                break;
            }
        }

        if (ind != undefined) {
            array[ind] = obj;
        }
    }

    /**
   * nahrazeni objektu v listu dle zadaneho predikatu
   */
    public static replaceOrAddObject<T>(array: T[], obj: T, predicate: (value: T) => boolean) {
        var ind;
        for (var index = 0; index < array.length; index++) {
            var sensorInt = array[index];
            if (predicate(sensorInt)) {
                ind = index
                break;
            }
        }

        if (ind != undefined) {
            array[ind] = obj;
        } else {
            array.push(obj);
        }
    }

}


export class ColorLegend {
    value: number;
    color: string;
    valueText: string;
    valueTextMobile: string;
    colorText: string;
}

export class ColorUtils {
    //private static colorValueMap: Map<string, boolean> = new Map<string, boolean>(){} ;
    public static colorValueMap: ColorLegend[] =
    [
        { value: -1, color: "#000000", valueText: "dB", valueTextMobile: "db", colorText: "white" },
        { value: 0, color: "#DAFFCE", valueText: "< 35", valueTextMobile: "<35", colorText: "black" },   // color:#d3ffbe
        { value: 35, color: "#38EF40", valueText: "35-40", valueTextMobile: "40", colorText: "black" },   // color:#79c67a
        { value: 40, color: "#008056", valueText: "40-45", valueTextMobile: "45", colorText: "white" },   // color:#79c67a
        { value: 45, color: "#F0F809", valueText: "45-50", valueTextMobile: "50", colorText: "black" },   // color:#1f8545 
        { value: 50, color: "#F1B79A", valueText: "50-55", valueTextMobile: "55", colorText: "black" },   // color:#ffffbe
        { value: 55, color: "#FFAD45", valueText: "55-60", valueTextMobile: "60", colorText: "black" },   // color:#ffff74
        { value: 60, color: "#FF1D2B", valueText: "60-65", valueTextMobile: "65", colorText: "black" },   // color:#ffc200
        { value: 65, color: "#BB2C28", valueText: "65-70", valueTextMobile: "70", colorText: "white" },   // color:#e60000
        { value: 70, color: "#CD3796", valueText: "70-75", valueTextMobile: "75", colorText: "white" },   // color:#b50000
        { value: 75, color: "#1491F8", valueText: "75-80", valueTextMobile: "80", colorText: "white" },   // color:#630a6c
        { value: 80, color: "#09369B", valueText: "80-85", valueTextMobile: "85", colorText: "white" },   // color:#001f9d
        { value: 85, color: "#001760", valueText: "85 >", valueTextMobile: "85>", colorText: "white" },
    ];

    public static getColor(value: number): string {
        let color;
        for (var index = 0; index < ColorUtils.colorValueMap.length; index++) {
            let valMin = ColorUtils.colorValueMap[index].value;
            if (valMin < value) {
                color = ColorUtils.colorValueMap[index].color;
            } else {
                return color;
            }
        }
        return color;
    }

    public static getColorText(value: number): string {
        let color;
        for (var index = 0; index < ColorUtils.colorValueMap.length; index++) {
            let valMin = ColorUtils.colorValueMap[index].value;
            if (valMin < value) {
                color = ColorUtils.colorValueMap[index].colorText;
            } else {
                return color;
            }
        }
        return color;
    }
}

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

export enum MonthList {
    Leden = 0,
    Unor,
    Berezen,
    Duben,
    Kveten,
    Cerven,
    Cervenec,
    Srpen,
    Zari,
    Rijen,
    Listopad,
    Prosinec
}

export class DateUtils {
    public static HOUR_IN_MILIS = 3600000;
    public static DAY_IN_MILIS = DateUtils.HOUR_IN_MILIS * 24;;


    public static toStringTimeOnly(d: Date) {
        // 9:50
        return  d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2);
    }

    public static toStringZerosTimeOnly(d: Date) {
        // 09:50
        return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    }

     public static toStringDateOnly(d: Date) {
        // 16.5.2015 9:50
        return d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
    }

    public static toStringZerosDateOnly(d: Date) {
        // 16.05.2015 09:50
        return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." +
            d.getFullYear();
    }

    public static toString(d: Date) {
        // 16.5.2015 9:50
        return d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear() + " " +
            d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2);
    }

    public static toStringZeros(d: Date) {
        // 16.05.2015 09:50
        return ("0" + d.getDate()).slice(-2) + "." + ("0" + (d.getMonth() + 1)).slice(-2) + "." +
            d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    }

    public static isBetween_dayInterval(date: Date, startDate: Date): boolean {
        let createdAt = date.getTime();
        let min = startDate.getTime();
        let max = startDate.getTime() + DateUtils.DAY_IN_MILIS;
        let isBetween = min <= createdAt && createdAt < max

        // console.log(isBetween, new Date(min).toLocaleString() + " <= " + new Date(createdAt).toLocaleString() + " < " + new Date(max).toLocaleString());
        return isBetween;
    }

    public static isBetween_dayIntervalFromMidnight(date: Date, startDate: Date): boolean {
        let createdAt = date.getTime();
        let min = DateUtils.getDayFlatDate(startDate).getTime();
        let max = DateUtils.getDayFlatDate(startDate).getTime() + DateUtils.DAY_IN_MILIS;
        let isBetween = min <= createdAt && createdAt < max

        // console.log(isBetween, new Date(min).toLocaleString() + " <= " + new Date(createdAt).toLocaleString() + " < " + new Date(max).toLocaleString());
        return isBetween;
    }

    /**
     * ocekavanzy format je 2016-10-04T07:55:32+0000
     */
    public static parseDate(dateStr): Date {
        // dateStr = "2016-10-04T07:55:32+0000"

        // 2016-10-04 , 07:55:32+0000
        var a = dateStr.split("T");

        // 2016, 10, 04 
        var d: string[] = a[0].split("-");

        // 07:55:32 , 0000
        if (a[1].includes(".")) {
            var time: string[] = a[1].split(".");
        } else {
            var time: string[] = a[1].split("+");
        }


        // 07, 55, 32 
        var t: string[] = time[0].split(":");

        // 0000
        // var tMilis: string = time[1];

        // "+"" znamena prevod na cislo
        var date = new Date(+d[0], +d[1] - 1, +d[2], +t[0], +t[1], +t[2]);;
        return date;
    }

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
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    public static getWeekEndDate(date: Date): Date {
        let dateInter = new Date(date);
        var startOfWeek = date.getDate() - date.getDay() + 7;
        dateInter.setDate(startOfWeek);
        dateInter.setHours(23);
        dateInter.setMinutes(59);
        dateInter.setSeconds(59);
        dateInter.setMilliseconds(999);
        return dateInter;
    }

    public static getMonthFlatDate(date: Date): Date {
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    public static getMonthEndDate(date: Date): Date {
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        lastDay.setHours(23);
        lastDay.setMinutes(59);
        lastDay.setSeconds(59);
        lastDay.setMilliseconds(999);
        return lastDay;
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

    public static getMidnight(date: Date): Date {
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
        return date;
    }

     public static getDateMinusDays(date: Date, numberOFDays: number): Date {
        let dateNew = new Date();
        dateNew.setDate(date.getDate() - numberOFDays);
        return dateNew;
    }
}

export class ObjectUtils {

    private isEquivalent(a, b) {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    }

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
        // console.log("deepCopy", from);
        // console.log(from, to);
        if (from == null || typeof from != "object") {
            // console.log("prvni");
            return from;
        }
        if (!(from instanceof Object) && !(from instanceof Array)) {
            // console.log("druhy");
            return from;
        }
        if (from instanceof Date) {
            // console.log("treti Date");
            return new Date(from);
        }
        // TODO i ostani objekty
        if (from instanceof RegExp || from instanceof Function ||
            from instanceof String || from instanceof Number || from instanceof Boolean) {
            throw "Ne vsechny objekty momentalne umim klonovat ... :( ) objekt: " + from;
            // return this.newInstance(from, from);
        }

        // console.log("ctvrty - ", from);

        to = to || Object.create(from);
        // console.log("4te to ", to);
        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? ObjectUtils.deepCopy(from[name], null) : to[name];
        }

        return to;
    }
}
