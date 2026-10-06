import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUpperCase]',
  standalone: true
})
export class UpperCaseDirective {

   constructor(
    private el: ElementRef,
    private control: NgControl
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const value = this.el.nativeElement.value.toUpperCase();

    this.el.nativeElement.value = value;
    this.control.control?.setValue(value, { emitEvent: false });
  }
}
