import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Logger } from "angular2-logger/core";
import { ResponsiveState, ResponsiveConfig } from 'ng2-responsive';

@Component({   
  selector: 'overlays-search',
  templateUrl: './overlays.search.component.html',
  styleUrls: ['./overlays.search.component.css'],
})

export class OverlaysSearchComponent {

  private xl: string = "xl";
  private lg: string = "lg";
  private isBigInternal: boolean;

  constructor(private log: Logger, responsiveState: ResponsiveState) {
    responsiveState.elementoObservar.subscribe(width => {
      this.isBigInternal = false;
      if (width === this.xl) {
         this.isBigInternal = true;
      }
      if (width === this.lg) {
         this.isBigInternal = true;
      }
    })
  }

  private isBig():boolean {
    if (this.isBigInternal == undefined) {
      throw "isBigInternal neni definovan";
    }
    return this.isBigInternal;
   }
}

// Následující observer vrací šířku diplaye v pixelech
// responsiveState.anchoObservar.subscribe(width => {
//     })