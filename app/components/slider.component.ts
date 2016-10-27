import { DateUtils } from '../utils/utils';
import { Component, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService, Events } from './sensors-shared.service';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { CRaService, DeviceDetailParams, DeviceParams, Order } from '../service/cra.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/Rx";
import 'rxjs/Rx';


@Component({
    moduleId: module.id,
    selector: 'slider',
    templateUrl: 'slider.component.html',
    styleUrls: ['./slider.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class SliderComponent implements AfterViewInit {
    private sliderId = "sliderInput"
    private slider: Slider;

    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
        sensorsSharedService.listenEventData(Events.mapInstance).subscribe(map => {
            let oldDate = SensorsSharedService.minDateLimit;
            this.removeSlider();

            // pocet bodu na slideru    
            let countOfpoint = 2;
            let aktualDate = new Date();

            // rozdil mezi kazdym bodem
            let diff = (aktualDate.getTime() - oldDate.getTime()) / countOfpoint;

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

            this.slider = new Slider('#' + this.sliderId, {
                ticks: ticks,
                ticks_labels: ticks_labels,
                ticks_snap_bounds: diff / 24,
                // definice zobrazeni datoveho modelu uzivateli v tooltipu 
                formatter: function (value) {
                    return new Date(value).toLocaleDateString();
                },
                id: "mainSlider",
                range: false,
            });

            // pokud se vybere nove datum provede se prenacteni dat s novym vychozim datem
            this.slider.on("slideStop", newDate => {
                this.sensorsSharedService.publishEvent(Events.sliderNewDate, new Date(newDate), "SliderComponent.slideStop event");
                let time = parseInt(newDate.toString());
                this.log.debug("slideStop - newDate: " + newDate)

                if (newDate != undefined) {
                    // todo udelat nad exist daty
                    this.sensorsSharedService.loadSensorsAndPublish(DateUtils.getDayFlatDate(new Date(parseInt(newDate.toString(), 10))));
                }
            });

            map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(document.getElementById("rectangle3"));
            
            // vybran je aktulani cas (neprovede se slideStop)
            this.slider.setValue(new Date().getTime());
        });
    }

    private removeSlider() {
        if (this.slider) {
            this.slider.destroy();
        }
    }

    ngAfterViewInit(): void {
    }
}