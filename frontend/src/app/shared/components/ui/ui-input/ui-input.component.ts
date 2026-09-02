import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ui-input.component.html',
  host: { class: 'block w-full' },
})
export class UiInputComponent {
  @Input() label?: string;
  @Input() labelStyle: 'micro' | 'normal' = 'micro';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() value: any = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() error?: string;
  @Input() hint?: string;
  @Input() min?: any;
  @Input() max?: any;
  @Input() step?: any;
  @Input() hasPrefix = false;
  @Input() hasSuffix = false;

  @Output() valueChange = new EventEmitter<any>();

  onModelChange(val: any): void {
    this.value = val;
    this.valueChange.emit(val);
  }
}
