import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { Logger } from "angular2-logger/core";

import { Overlay } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap';

@Component({
  selector: 'about-app',
  templateUrl: 'app/components/about.app.component.html',
  styleUrls: ['app/components/about.app.component.css'],
  template: 
  `
  <div id="aboutAppId" class="aboutApp" *hideItDevice="['mobile']">
	  <button type="button" class="btn btn-primary aboutAppButton" (click)="onAboutAppClick()" tooltip="O aplikaci" tooltipPopupDelay="1500" tooltipPlacement="left"> 
        <img class="aboutAppIcoDown" src="data:image/png;base64,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">
  </button>
</div>

  <div id="aboutAppId" class="aboutAppMobile" *showItDevice="['mobile']">
	  <button type="button" class="btn btn-primary aboutAppButtonM" (click)="onAboutAppClickMobile()" tooltip="O aplikaci" tooltipPopupDelay="1500" tooltipPlacement="left"> 
        <img class="aboutAppIcoDown" src="data:image/png;base64,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">
  </button>
</div>
`
})
export class AboutAppComponent {
  //collapse content
  // public isHidden: boolean = true;

  constructor(overlay: Overlay, vcRef: ViewContainerRef, public modal: Modal) {
    overlay.defaultViewContainer = vcRef;
  }

  onAboutAppClick() {
    this.modal.alert()
      .size('lg')
      .showClose(true)
      .title('O aplikaci')
      .body(`
            <h4>O společnosti OKSystem a.s.</h4>
            <p>OKsystem je česká softwarová společnost s mezinárodní působností. Na trhu informačních technologií jsme již od roku 1990. 
            Naše programy používají desítky tisíc uživatelů v soukromém sektoru i veřejné správě. Máme zákazníky zejména v České republice 
            a dodáváme inovativní software i v Evropě a USA.</p>
            <p>Více informací naleznete na http://www.oksystem.com/cz/</p>

            <br>
            <br>

            <h4>Aplikace "Hlukové mapy"</h4>
            
            <b>Aplikace se skládá z:</b>
            <ul>
                <li>Google mapy a jejích ovládacích prvků.</li>
                <li>Komponenty pro výběr vrstvy hlukové mapy.</li>
                <li>Legendy mapy.</li>
                <li>Komponenty pro výběr čidla.</li>
                <li>Komponenty pro zobrazení grafů a statistik vybraného čidla.</li>
                <li>Komponenty slider, která umožňuje vybrat datum měření čidla.</li>
            </ul>
            
            <br>

            <h4>Aplikace podporuje nejnovější verze prohlížečů:</h4>
            <ul>
                <li>Google Chrome</li>
                <li>Opera</li>
                <li>Safari</li>
                <li>Firefox</li>
                <li>Internet Explorer</li>
                <li>Edge</li>
            </ul>
            `)
      .open();
  }

  onAboutAppClickMobile() {
    this.modal.alert()
      .size('sm')
      .showClose(true)
      .title('O aplikaci')
      .body(`
            <h4>O společnosti OKSystem a.s.</h4>
            <p>OKsystem je česká softwarová společnost s mezinárodní působností. Na trhu informačních technologií jsme již od roku 1990. 
            Naše programy používají desítky tisíc uživatelů v soukromém sektoru i veřejné správě. Máme zákazníky zejména v České republice 
            a dodáváme inovativní software i v Evropě a USA.</p>
            <p>Více informací naleznete na http://www.oksystem.com/cz/</p>

            <br>
            <br>

            <h4>Aplikace "Hlukové mapy"</h4>
            
            <b>Aplikace se skládá z:</b>
            <ul>
                <li>Google mapy a jejích ovládacích prvků.</li>
                <li>Komponenty pro výběr vrstvy hlukové mapy.</li>
                <li>Legendy mapy.</li>
                <li>Komponenty pro výběr čidla.</li>
                <li>Komponenty pro zobrazení grafů a statistik vybraného čidla.</li>
                <li>Komponenty slider, která umožňuje vybrat datum měření čidla.</li>
            </ul>
            
            <br>

            <h4>Aplikace podporuje nejnovější verze prohlížečů:</h4>
            <ul>
                <li>Google Chrome</li>
                <li>Opera</li>
                <li>Safari</li>
                <li>Firefox</li>
                <li>Internet Explorer</li>
                <li>Edge</li>
            </ul>
            `)
      .open();
  }
}