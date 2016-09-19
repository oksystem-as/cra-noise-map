import { Component, AfterViewInit, ViewChild } from '@angular/core';
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
//import '../../node_modules/google-maps/lib/Google.js';
// import { CRaService } from '../service/cra.service';
// import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
// import { RHF1S001PayloadResolver } from '../payloads/RHF1S001PayloadResolver';
// import { DeviceDetail } from '../entity/device/detail/device-detail';
import { SensorsSharedService } from './sensors-shared.service';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../service/cra.service';


@Component({
    selector: 'slider',
    templateUrl: 'app/components/slider.component.html',
    styleUrls: ['app/components/slider.component.css'],
})
export class SliderComponent implements AfterViewInit {
    private slider : Slider;

    constructor(private sensorsSharedService: SensorsSharedService) { }

    ngAfterViewInit(): void {
        this.sensorsSharedService.getMinDate().subscribe(oldDate => {
            if (this.slider) {
                this.slider.destroy();
            }
            let countOfpoint = 5;
            let aktualDate = new Date();

            let diff = (aktualDate.getTime() - oldDate.getTime()) / countOfpoint;

            console.log(diff);

            let ticks_labels = [];
            let ticks = [];
            ticks.push(oldDate.getTime());
            ticks_labels.push(oldDate.toLocaleDateString());
            let pom;

            for (var index = 1; index < countOfpoint; index++) {
                pom = new Date(oldDate.getTime() + index * diff);
                ticks.push(pom.getTime());
                ticks_labels.push(pom.toLocaleDateString());
            }

            ticks.push(aktualDate.getTime());
            ticks_labels.push(aktualDate.toLocaleDateString());

            console.log(ticks);
            console.log(ticks_labels);

            this.slider = new Slider('#ex1', {
                ticks: ticks,
                ticks_labels: ticks_labels,
                ticks_snap_bounds: diff / 24,
                // tooltip: "test sads asd a sd as ",
                // tooltip_split: true,
                formatter: function (value) {
                    return new Date(value).toLocaleString();
                },
                id: "slider"
            });

            this.slider.on("slide", cokoliv => {
                console.log(cokoliv)
                  let devicedetailParams = <DeviceDetailParams>{
                        start: new Date(cokoliv.value.toString()),
                        limit: 1,
                        order: Order.asc
                    }
                 this.sensorsSharedService.loadGps(devicedetailParams);    
            });
        });
    }
}