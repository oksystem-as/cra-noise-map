import {Directive, Input, HostBinding,  ElementRef, Renderer } from '@angular/core';


@Directive({selector: '[collapse]'})
export class Collapse {
    // style
    @HostBinding('style.height')
    private height:string;
    // shown
    @HostBinding('class.in')
    @HostBinding('attr.aria-expanded')
    private isExpanded:boolean = true;
    // hidden
    @HostBinding('attr.aria-hidden')
    private isCollapsed:boolean = false;
    // stale state
    @HostBinding('class.collapse')
    private isCollapse:boolean = true;
    // animation state
    @HostBinding('class.collapsing')
    private isCollapsing:boolean = false;



    @Input()
    private set collapse(value:boolean) {
        this.isExpanded = value;
        this.toggle();
    }

    private get collapse():boolean {
        return this.isExpanded;
    }

     constructor(el: ElementRef, renderer: Renderer) {
    //    renderer.setElementStyle(el.nativeElement, 'backgroundColor', 'yellow');
    //    console.log("Collapse ",  el, renderer );
    }
    toggle() {
        if (this.isExpanded) {
            this.hide();
        } else {
            this.show();
        }
    }

    hide() {
        console.log("hide ",  this.height );
        this.isCollapse = false;
        this.isCollapsing = true;

        this.isExpanded = false;
        this.isCollapsed = true;
        setTimeout(() => {
            this.height = '0';
            this.isCollapse = true;
            this.isCollapsing = false;
        }, 4);
    }

    show() {
        console.log("show ",  this.height );
        this.isCollapse = false;
        this.isCollapsing = true;

        this.isExpanded = true;
        this.isCollapsed = false;
        setTimeout(() => {
            this.height = 'inherit';

            this.isCollapse = true;
            this.isCollapsing = false;
        }, 4);
    }
}
