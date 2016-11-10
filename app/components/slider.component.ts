import { DateUtils } from '../utils/utils';
import { Component, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Logger } from "angular2-logger/core";
/// <reference path="../../typings/globals/googlemaps/google.maps.d.ts" />
/// <reference path="../../typings/globals/markerclustererplus/markerclustererplus.d.ts" />
import { SensorsSharedService, Events } from './sensors-shared.service';

import { ARF8084BAPayload } from '../payloads/ARF8084BAPayload';
import { RHF1S001Payload } from '../payloads/RHF1S001Payload';
import { CRaService, DeviceDetailParams, Order } from '../service/cra.service';
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

        sensorsSharedService.listenEventData(Events.sliderNewDate).subscribe(date => {
            if (this.slider) {
                this.slider.setValue(new Date(date).getTime());
            }
        });

        sensorsSharedService.listenEventData(Events.mapInstance).subscribe(map => {
            let oldDate = SensorsSharedService.minDateLimit;
            this.removeSlider();

            // pocet bodu na slideru    
            let countOfpoint = 3;
            let aktualDate = DateUtils.getDayFlatDate(new Date());

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
                let flatDate = DateUtils.getDayFlatDate(new Date(pom.getTime()));
                ticks.push(flatDate.getTime());
                ticks_labels.push(flatDate.toLocaleDateString());
            }

            // definice posledniho bodu
            ticks.push(aktualDate.getTime());
            ticks_labels.push(aktualDate.toLocaleDateString());

            this.slider = new Slider('#' + this.sliderId, {
                ticks: ticks,
                ticks_labels: ticks_labels,
                //ticks_snap_bounds: diff / 36,
                // definice zobrazeni datoveho modelu uzivateli v tooltipu 
                formatter: function (value) {
                    return new Date(value).toLocaleDateString();
                },
                id: "mainSlider",
                range: false,
                tooltip:"always",
            });

            // pokud se vybere nove datum provede se prenacteni dat s novym vychozim datem
            this.slider.on("slideStop", newDate => {
                let time = parseInt(newDate.toString());
                this.log.debug("slideStop - newDate: " + newDate)
                let date = new Date(parseInt(newDate.toString(), 10));
                let flatDate = DateUtils.getDayFlatDate(date);

                if (newDate != undefined) {
                    this.sensorsSharedService.loadSensorsAndPublish(date);
                    this.sensorsSharedService.publishEvent(Events.sliderNewDate, flatDate, "SliderComponent.slideStop event");
                }
            });

            // map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(document.getElementById("rectangle3"));

            // vybran je aktulani cas (neprovede se slideStop)
            this.slider.setValue(new Date().getTime());
            this.refreshSlider();
        });
    }

    private removeSlider() {
        if (this.slider) {
            this.slider.destroy();
        }
    }

    public refreshSlider() {
        // hotfix - nevim uplne proc, ale funguje to ...
        setTimeout(() => {
            if (this.slider) {
                this.slider.relayout();
            }
        }, 1000)
    }

    ngAfterViewInit(): void {
        this.refreshSlider();
    }
}