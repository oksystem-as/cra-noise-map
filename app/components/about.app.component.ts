import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Logger } from "angular2-logger/core";

@Component({
  selector: 'about-app',
  templateUrl: 'app/components/about.app.component.html',
  styleUrls: ['app/components/about.app.component.css'],
})
export class AboutAppComponent {
    //collapse content
    public isHidden: boolean = true;
}