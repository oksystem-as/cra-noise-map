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
  private md: string = "md";
  private sm: string = "sm";
  private xs: string = "xs";

  private firefox: string = "firefox";

  private isExtraLargeInternal: boolean = false;
  private isLargeInternal: boolean = false;
  private isMediumInternal: boolean = false;
  private isSmallInternal: boolean = false;
  private isExtraSmallInternal: boolean = false;

  private isFirefoxInternal: boolean = false;

  constructor(private log: Logger, responsiveState: ResponsiveState) {
    responsiveState.elementoObservar.subscribe(width => {
      this.isExtraLargeInternal = false;
      this.isLargeInternal = false;
      this.isMediumInternal = false;
      this.isSmallInternal = false;
      this.isExtraSmallInternal = false;

      this.isExtraLargeInternal = (width === this.xl);
      this.isLargeInternal = ( width === this.lg);
      this.isMediumInternal = ( width === this.md);
      this.isSmallInternal = ( width === this.sm);
      this.isExtraSmallInternal = ( width === this.xs);
    });

    responsiveState.browserObserver.subscribe(browser => {
      this.isFirefoxInternal = false;
      if (browser === this.firefox) {
        this.isFirefoxInternal = true;
      }
    });
  }

  private isExtraLarge(): boolean {
    if (this.isExtraLargeInternal == undefined) {
      throw "isExtraLargeInternal neni definovan";
    }
    return this.isExtraLargeInternal;
  }

  private isLarge(): boolean {
    if (this.isLargeInternal == undefined) {
      throw "isLargeInternal neni definovan";
    }
    return this.isLargeInternal;
  }

  private isMedium(): boolean {
    if (this.isMediumInternal == undefined) {
      throw "isMediumInternal neni definovan";
    }
    return this.isMediumInternal;
  }

  private isSmall(): boolean {
    if (this.isSmallInternal == undefined) {
      throw "isSmallInternal neni definovan";
    }
    return this.isSmallInternal;
  }

  private isExtraSmall(): boolean {
    if (this.isExtraSmallInternal == undefined) {
      throw "isExtraSmallInternal neni definovan";
    }
    return this.isExtraSmallInternal;
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