import { Component, AfterViewInit } from '@angular/core';
import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { ARF8084BAPayloadResolver } from '../payloads/ARF8084BAPayloadResolver';

import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { RHF1S001PayloadResolver } from '../payloads/RHF1S001PayloadResolver';

import { Data } from './test.data';
import { Observable, } from 'rxjs/Observable';
import { IntervalObservable } from 'rxjs/Observable/IntervalObservable';
import { ArrayUtils, MonthList, ObjectUtils } from '../utils/utils';

import 'rxjs/Rx';


class DateUtils {
  public static setHourFlatDate(date: Date) {
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }

  public static getHourFlatDateFromMillis(dateMillis: number): Date {
    let date = new Date(dateMillis);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  public static getDayFlatDateFromMillis(dateMillis: number): Date {
    let date = new Date(dateMillis);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }
}

class RxUtils {
  public static groupByHours(data: { time: number, value: number }[]): Observable<any> {
    var source = Observable.from(data).groupBy(
      data => {
        return DateUtils.getHourFlatDateFromMillis(data.time).getTime()
      },
      data => {
        data.time = DateUtils.getHourFlatDateFromMillis(data.time).getTime();
        return data;
      });
    return source;
  }

  public static groupByDays(data: { time: number, value: number }[]): Observable<any> {
    var source = Observable.from(data).groupBy(
      data => {
        return DateUtils.getDayFlatDateFromMillis(data.time).getTime()
      },
      data => {
        data.time = DateUtils.getDayFlatDateFromMillis(data.time).getTime();
        return data;
      });
    return source;
  }
}

@Component({
  selector: 'test',
  template: `
      <button (click)="testARF8084BA()">testARF8084BA</button>
      <button (click)="testRHF1S001()">testRHF1S001</button>
      <button (click)="testObs()"> testObs()</button>
      <button (click)="testObservable()"> testObservable()</button>
  `,
})
export class TestComponent {

  constructor() {
    this.testCloningAdv();
  }

  private randomNumber(){
    let init = 30;
    for (var index = 0; index < 20000; index++) {
      init += Math.sin(index/30)
      console.log(Math.floor(init))
      // init = init + Math.floor(Math.sin(init));
      // console.log(init, Math.floor(Math.sin(init)))
    }
  }
  
  // porad nefunguje :( - test pri transpilaci do ES5
  private extendedArray(){
    class ExtendedArray<T> extends Array<T> {}

    var buildinArray = new Array<string>();
    var extendedArray = new ExtendedArray<string>();
    
    buildinArray.push("A");
    console.log(buildinArray.length); // 1 - OK
    buildinArray[2] = "B";
    console.log(buildinArray.length); // 3 - OK
    
    extendedArray.push("A");
    console.log(extendedArray.length); // 1 - OK
    extendedArray[2] = "B";
    console.log(extendedArray.length); // 1 - FAIL
    console.dir(extendedArray); // both values, but wrong length
  }

  private timeRxJS() {
    // var idealBatchSize = 15;
    // var maxTimeDelay = TimeSpan.FromSeconds(3);
    // var source = Observable.interval(TimeSpan.FromSeconds(1)).Take(10)
    // .Concat(Observable.Interval(TimeSpan.FromSeconds(0.01)).Take(100));
    // source.Buffer(maxTimeDelay, idealBatchSize)
    // .Subscribe(
    // buffer => Console.WriteLine("Buffer of {1} @ {0}", DateTime.Now, buffer.Count), 
    // () => Console.WriteLine("Completed"));

    var list = [100, 101, 102, 103]

    var source3 = Observable.from(list)
      .concatMap(function (event) {
        return Observable.timer(1000).map(((data, idx) => {
          console.log(" data filtered ", data);
          return { hour: event };
        }))
     });

     var source4 = Observable.from(list)
    .map( (x) => {
        return Observable.timer(1000);
    });


    var source2 = IntervalObservable.from(list).timeInterval();
    var source = Observable.interval(1000 /* ms */).take(list.length);

    // .

    // .timeInterval()
    // .take(4);

    var subscription = source4.subscribe(
      function (x) {
        console.log('Next: ', x);
      },
      function (err) {
        console.log('Error: ', err);
      },
      function () {
        console.log('Completed');
      });
  }


  // private deepCopyArr(array: any[]): any[] {
  //   var out = [];
  //   for (var i = 0, len = array.length; i < len; i++) {
  //     var item = array[i];
  //     var obj = {};
  //     for (var k in item) {
  //       obj[k] = this.deepCopy(item[k], undefined);
  //     }
  //     out.push(obj);
  //   }
  //   return out;
  // }

  // private deepCopy(from, to) {
  //   if (from == null || typeof from != "object") return from;
  //   if (from.constructor != Object && from.constructor != Array) return from;
  //   if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
  //     from.constructor == String || from.constructor == Number || from.constructor == Boolean)
  //     return new from.constructor(from);

  //   to = to || new from.constructor();

  //   for (var name in from) {
  //     to[name] = typeof to[name] == "undefined" ? this.deepCopy(from[name], null) : to[name];
  //   }

  //   return to;
  // }

  testCloningAdv() {
    let payload1 = new RHF1S001Payload();
    payload1.createdAt = new Date(2015, 1, 1);

    let payload2 = new RHF1S001Payload();
    payload2.createdAt = new Date(2016, 1, 1);

    let arr = [payload1, payload2];

    var clone = ObjectUtils.deepCopyArr(arr);
    clone[1].createdAt = new Date(2017, 1, 1);

    console.log(arr);
    console.log(clone);

  }

  testCloning() {
    var obj =
      {
        date: new Date(),
        func: function (q) { return 1 + q; },
        num: 123,
        text: "asdasd",
        array: [1, "asd"],
        regex: new RegExp(/aaa/i),
        subobj:
        {
          num: 234,
          text: "asdsaD"
        }
      }

    var clone = ObjectUtils.deepCopy(obj, undefined);
    clone.date = new Date(2015, 1, 1);
    console.log(obj, clone);
  }

  // pekna konstrukce
  //  var source = Observable.from(data).groupBy(
  //     x => { return Math.trunc(x.hour) },
  //     data => {
  //       return { hour: Math.trunc(data.hour), value: data.value };
  //     }).flatMap(function (x) {
  //       console.log('Nextx: ', x);
  //       return x.map((data, idx) => {
  //         console.log(" data filtered ", data);
  //         return { hour: data.hour, value: Math.pow(10, (data.value / 10)) };
  //       })
  //     });

  // .flatMap((data, idx) => {
  //     console.log("flatMap", data.payloads);
  //     return data.payloads;
  // })


  testObservable3() {
    let datain = new Data()
    let data = datain.timeValueData

    //var source = RxUtils.groupByHours(data);
    var source = RxUtils.groupByDays(data);

    source.subscribe(group => {
      // console.log('group: ', group);

      // uprava value a pridani count
      let powDataStream = group.map((data, idx) => {
        let powValue = Math.pow(10, (data.value / 10))
        let powObj = { count: idx + 1, time: data.time, powValue: powValue, sumValue: powValue };
        return powObj;
      });

      // soucet value
      let sumDataStream = powDataStream.reduce((a, b) => {
        b.sumValue = b.powValue + a.sumValue;
        return b;
      });

      // logaritm. prumer ze souctu a poctu polozek (jen pro danou hodinu)
      let logAvgDataStream = sumDataStream.map((data, idx) => {
        let avgObj = { time: data.time, logAverange: 10 * Math.log(data.sumValue / data.count) / Math.log(10) };
        return avgObj;
      })

      // zobrazeni a spusteni straemu
      logAvgDataStream.subscribe(data => {
        console.log(' [data]: ', data.time, new Date(data.time).toLocaleString(), data);
      });

    });
  }

  testObservable2() {
    // zobrazeni a spusteni straemu
    // group.subscribe((data) => {
    //   // console.log(' [data]: ', data);
    //   console.log(' [data]: ', data.time, new Date(data.time).toLocaleString(), data.value);
    // });

    // ,
    //   (err) => { console.log('Error: ' + err); },
    //   () => { console.log('Completed') });



    // var source = Observable
    //   .range(1, 2)
    //   .flatMap(function (x) {
    //     console.log('Nextx: ' + x);
    //     return Observable.range(x, 2);
    //   });

    // var subscription = source.subscribe(
    //   function (x) { console.log('Next: ' + x); },
    //   function (err) { console.log('Error: ' + err); },
    //   function () { console.log('Completed'); });


    let data: { hour: number, value: number }[] = [
      { hour: 1.1, value: 40 },
      { hour: 1.2, value: 10 },
      { hour: 1, value: 8 },
      { hour: 2.8, value: 4 },
      { hour: 3.1, value: 80 },
      { hour: 3, value: 12 },
      { hour: 3.8, value: 16 },
      { hour: 3, value: 30 },
      { hour: 4.4, value: 44 },
      { hour: 4, value: 22 },
      { hour: 4.8, value: 80 },
      { hour: 4, value: 51 },
    ];

    var source = Observable.from(data).groupBy(
      x => { return Math.trunc(x.hour) },
      data => {
        return { hour: Math.trunc(data.hour), value: data.value };
      });

    source.subscribe(group => {
      console.log('group: ', group);

      // uprava value a pridani count
      let powDataStream = group.map((data, idx) => {
        console.log(" raw data     ", data);
        let powValue = Math.pow(10, (data.value / 10))
        let powObj = { count: idx + 1, hour: data.hour, powValue: powValue, sumValue: powValue };
        console.log(" pow data     ", powObj);
        return powObj;
      });

      // soucet value
      let sumDataStream = powDataStream.reduce((a, b) => {
        console.log(' reduce bef. data: ', a, b);
        b.sumValue = b.powValue + a.sumValue;
        console.log(' reduce data: ', a, b);
        return b;
      });

      // logaritm. prumer ze souctu a poctu polozek (jen pro danou hodinu)
      let logAvgDataStream = sumDataStream.map((data, idx) => {
        let avgObj = { hour: data.hour, logAverange: 10 * Math.log(data.sumValue / data.count) / Math.log(10) };
        console.log(" avg data     ", data);
        return avgObj;
      })

      // zobrazeni a spusteni straemu
      logAvgDataStream.subscribe(data => {
        console.log(' [data]: ', data);
      });

    });
  }

  testObservable() {
    let data: { hour: number, value: number }[] = [
      { hour: 1, value: 40 },
      { hour: 1, value: 10 },
      { hour: 1, value: 8 },
      { hour: 2, value: 4 },
      { hour: 3, value: 80 },
      { hour: 3, value: 12 },
      { hour: 3, value: 16 },
      { hour: 3, value: 30 },
      { hour: 4, value: 44 },
      { hour: 4, value: 22 },
      { hour: 4, value: 80 },
      { hour: 4, value: 51 },
    ];

    let filteredStream = Observable.from(data)
      .filter((data, idx) => {
        let olderHour = 0;
        let youngerHour = 1;
        console.log("data vse     ", data);
        return olderHour < data.hour && data.hour <= youngerHour;
      }).map((data, idx) => {
        console.log("data filtered ", data);
        return { count: 1, typ: 1, value: Math.pow(10, (data.value / 10)) };
      }).scan((acc, x) => {
        console.log("data add      ", acc, x);
        return { count: acc.count + 1, typ: acc.typ, value: acc.value + x.value };
      }).last()
      .map((data, idx) => {
        console.log("data filtered2 ", data);
        let final = 10 * Math.log(data.value / data.count) / Math.log(10);
        return { typ: 1, logAverange: final };
      })

    let filteredStream2 = Observable.from(data)
      .filter((data, idx) => {
        let olderHour = 2;
        let youngerHour = 3;
        console.log("data2 vse     ", data);
        return olderHour < data.hour && data.hour <= youngerHour;
      }).map((data, idx) => {
        console.log("data2 filtered ", data);
        return { count: 1, typ: 2, value: Math.pow(10, (data.value / 10)) };
      }).scan((acc, x) => {
        console.log("data2 add      ", acc, x);
        return { count: acc.count + 1, typ: acc.typ, value: acc.value + x.value };
      }).last()
      .map((data, idx) => {
        console.log("data2 filtered2 ", data);
        let final = 10 * Math.log(data.value / data.count) / Math.log(10);
        return { typ: 2, logAverange: final };
      })

    // filteredStream.last().subscribe(data => {
    //   console.log("data final    ", data);
    // });

    // let reduceStream = filteredStream.reduce((a, b) => {
    //   console.log("data test3  ", a, b);
    //   return a + b.value;
    // }, 0)

    // let superStream = Observable.forkJoin(filteredStream, filteredStream2); //  dva objekty do []
    //let superStream = Observable.zip(filteredStream, filteredStream2);
    let superStream = Observable.merge(filteredStream, filteredStream2); // dva objekty samostatne

    superStream.subscribe(data => {
      console.log("data final    ", data);
    });

    // let countStream = filteredStream.count();

    // let superStream = Observable.forkJoin(reduceStream, countStream);

    // // superStream.subscribe(data => {
    // //   console.log("data pow ", data);
    // // });

    // let reduceStream2 = filteredStream.reduce((a, b) => {
    //   console.log("data test3  ", a, b);
    //   return a + b.value;
    // }, 0).zip(countStream);

    //   reduceStream2.subscribe(data => {
    //   console.log("data pow ", data);
    // });

    // filteredStream.subscribe(data => {
    //   console.log("data pow ", data);
    //   sum += data.value;
    //   count++;
    //   //this.log.debug("-(0, 1) cas " + payload.typ + " "+ payload.payload.createdAt.toLocaleTimeString());
    // },
    //   e => console.log('statisticsData.onError: %s', e),
    //   () => {
    //     console.debug("data - sum a count ", sum, count);
    //   }
    //   );


    // filteredStream.combineAll((data, idx) => {
    //   console.log("data test  ", data);
    //   return 8;
    // })

    // filteredStream.combineLatest((data, idx) => {
    //   console.log("data test2  ", data);
    //   return 8;
    // })

    // filteredStream.reduce(function (a, b) {
    //     console.log("data test3  ", a, b);
    //     return a + b.value;
    // }, 1)
  }


  testARF8084BA(): void {
    let payloads = ["de1e500035500142782088400cf0",
      "df1850005270014278604eba0cf37104", "ae2d03010cec", "9e28501306200143477006020cea",
      "9f255001747001427290381a0cec7ff7", "8e2442260ceb", "8f2208ed0cf086f0"];

    let aRF8084BAPayloadResolver = new ARF8084BAPayloadResolver();
    //   console.log(aRF8084BAPayloadResolver.resolve("de1e500035500142782088400cf0"));  
    payloads.forEach(payload => {
      console.log(aRF8084BAPayloadResolver.resolve(payload));
    });
  }

  testRHF1S001(): void {
    let payload = "016c689d39309029C8";
    let rHF1S001PayloadResolver = new RHF1S001PayloadResolver();
    console.log(rHF1S001PayloadResolver.resolve(payload));
    console.log("----------");
  }


  testObs() {
    let data = new Observable(observer => {

      setTimeout(() => {
        observer.next([10, 20, 30]);
      }, 1000);

      setTimeout(() => {
        observer.next([40, 50, 60]);
      }, 2000);

      setTimeout(() => {
        observer.complete();
      }, 3000);

    });

    let subscriber = data.subscribe((value: number[]) => {
      let i = 1;
      value.forEach(element => {
        setTimeout(function () {
          console.log(element)
        }, 2000 * i++);
      });

    },
      err => console.log(err),
      () => console.log('done')
    );

    //  setTimeout(function() {
    //         console.log(10)
    //       }, 2000 );


    //  setTimeout(function() {
    //         console.log(100)
    //       }, 2000 );

    //  setTimeout(function() {
    //         console.log(1000)
    //       }, 2000 );

    //   let i = 1;
    //  [100, 200, 300].forEach(element => {
    //   setTimeout(() => {
    //     console.log(element)
    //   }, 2000 * i++);
    // });

    // let obs = Observable.interval(1000).take(7);

    // let firstsub = obs.subscribe(x => console.log('first sub: ' + x));

    // setTimeout(() => {
    //   let secondsub = obs.subscribe(x => console.log('second sub: ' + x));
    // }, 3000)


    // let obs = Observable.interval(1000).take(7).publish().refCount();

    // let firstsub = obs.subscribe(x => console.log('first sub: ' +x));

    // setTimeout(() => {
    //   let secondsub = obs.subscribe(x => console.log('second sub: ' +x));
    // },3000)
  }


}