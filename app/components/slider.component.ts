import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Logger } from "angular2-logger/core";
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
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/Rx";
import 'rxjs/Rx';


@Component({
    selector: 'slider',
    templateUrl: 'app/components/slider.component.html',
    styleUrls: ['app/components/slider.component.css'],
})
export class SliderComponent implements AfterViewInit {
    private slider: Slider;
    // private selectedDate: number;


    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) { }


    private removeSlider() {
        if (this.slider) {
            this.slider.destroy();
        }
    }
    ngAfterViewInit(): void {
        this.sensorsSharedService.getMinDate().subscribe(oldDate => {
            this.removeSlider();

            // pocet bodu na slideru    
            let countOfpoint = 8;
            let aktualDate = new Date();

            // rozdil mezi kazdym bodem
            let diff = (aktualDate.getTime() - oldDate.getTime()) / countOfpoint;

            this.log.debug(diff);

            let ticks_labels = [];
            let ticks = [];

            // definice prvniho bodu
            ticks.push(oldDate.getTime());
            ticks_labels.push(oldDate.toLocaleDateString());

            let pom;
            for (var index = 1; index < countOfpoint; index++) {
                pom = new Date(oldDate.getTime() + index * diff);
                // dalsi body
                ticks.push(pom.getTime());
                ticks_labels.push(pom.toLocaleDateString());
            }

            // definice posledniho bodu
            ticks.push(aktualDate.getTime());
            ticks_labels.push(aktualDate.toLocaleDateString());

            this.log.debug(ticks);
            this.log.debug(ticks_labels);

            this.slider = new Slider('#sliderInput', {
                ticks: ticks,
                ticks_labels: ticks_labels,
                ticks_snap_bounds: diff / 24,
                // definice zobrazeni datoveho modelu uzivateli v tooltipu 
                formatter: function (value) {
                    return new Date(value).toLocaleString();
                },
                id: "slider"
            });

            // pokud se vybere nove datum provede se prenacteni dat s novym vychozim datem
            this.slider.on("slideStop", newDate => {
                let time = parseInt(newDate.toString());
                // this.selectedDate = this.slider.getValue();
                this.log.debug("slideStop - " + newDate)

                if (newDate != undefined) {
                    let devicedetailParams = <DeviceDetailParams>{
                        start: new Date(parseInt(newDate.toString(), 10)),
                        limit: 50,
                        order: Order.asc
                    }
                    this.sensorsSharedService.loadGps(devicedetailParams);
                }
            });
            
            // po kazdem nacteni se nastavi vybrane datum 
            // this.sensorsSharedService.setSelectedDate(this.selectedDate);
        });

        // this.sensorsSharedService.getSelectedDate().subscribe(date => {
        //     if (date != undefined) {
        //         this.slider.setValue(date);
        //     }
        // });
    }
}