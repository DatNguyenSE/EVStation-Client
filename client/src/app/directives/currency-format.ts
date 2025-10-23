import { Directive, ElementRef, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appCurrencyFormat]'
})
export class CurrencyFormatDirective implements OnChanges {
  @Input() appCurrencyFormatModel: any; // ✅ đổi tên tránh conflict với ngModel
  private el: HTMLInputElement;

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
  }

  @HostListener('input')
  onInput() {
    this.formatValue();
  }

  @HostListener('blur')
  onBlur() {
    this.formatValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appCurrencyFormatModel']) {
      setTimeout(() => this.formatValue(), 0);
    }
  }

  private formatValue() {
    let value = this.el.value.replace(/[,.]/g, '');
    if (!isNaN(Number(value)) && value !== '') {
      this.el.value = Number(value).toLocaleString('vi-VN');
    } else {
      this.el.value = '';
    }
  }
}
