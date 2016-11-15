import { setTimeout } from 'timers';
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
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';


@Component({
    selector: 'loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.css'],
    // encapsulation: ViewEncapsulation.None
})
export class LoadingComponent {//implements AfterViewInit {
    @ViewChild('childModal') public childModal: ModalDirective;


    constructor(private log: Logger, private sensorsSharedService: SensorsSharedService) {
        sensorsSharedService.listenEventData(Events.showMasterLoading).subscribe((show) => {
            if (show) {
                this.showChildModal();
            } else {
                this.hideChildModal();
            }
        });
    }

    // ngAfterViewInit(): void {
    // setTimeout(() => {
    //         this.showChildModal();
    //     }, 5000);

    //     setTimeout(() => {
    //         this.hideChildModal();
    //     }, 10000);
    // }

    public onHidden(): void {
         this.sensorsSharedService.publishEvent(Events.onHiddenMasterLoading, true);
    }

    public showChildModal(): void {
        this.childModal.show();
    }

    public hideChildModal(): void {
        this.childModal.hide();
    }
}