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
  private firefox: string = "firefox";

  private isBigInternal: boolean;
  private isFirefoxInternal: boolean;

  constructor(private log: Logger, responsiveState: ResponsiveState) {
    responsiveState.elementoObservar.subscribe(width => {
      this.isBigInternal = (width === this.xl || width === this.lg);
    });

    responsiveState.browserObserver.subscribe(browser => {
      this.isFirefoxInternal = false;
      if (browser === this.firefox) {
        this.isFirefoxInternal = true;
      }
    });
  }

  private isBig(): boolean {
    if (this.isBigInternal == undefined) {
      throw "isBigInternal neni definovan";
    }
    return this.isBigInternal;
  }

  private isFirefox(): boolean {
    if (this.isFirefoxInternal == undefined) {
      throw "isFirefoxInternal neni definovan";
    }
    return this.isFirefoxInternal;
  }
}

// Následující observer vrací šířku diplaye v pixelech
// responsiveState.anchoObservar.subscribe(width => {
//     })