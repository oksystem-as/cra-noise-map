import { Component, AfterViewInit } from '@angular/core';
import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { ARF8084BAPayloadResolver } from '../payloads/ARF8084BAPayloadResolver';

import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { RHF1S001PayloadResolver } from '../payloads/RHF1S001PayloadResolver';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';

@Component({
  selector: 'test',
  template: `
      <button (click)="testARF8084BA()">testARF8084BA</button>
      <button (click)="testRHF1S001()">testRHF1S001</button>
      <button (click)="testObs()"> testObs()</button>
  `,
})
export class TestComponent {
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

      //   },
      //   err => console.log(err),
      //   () => console.log('done')
      // );

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