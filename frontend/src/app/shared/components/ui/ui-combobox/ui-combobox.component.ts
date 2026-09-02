import { Component, Input, Output, EventEmitter, ElementRef, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ComboboxOption {
  label: string;
  value: any;
  subtext?: string;
  badge?: string;
}

@Component({
  selector: 'ui-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ui-combobox.component.html',
  host: { class: 'block w-full' },
})
export class UiComboboxComponent {
  @Input() options: ComboboxOption[] = [];
  @Input() value: any = null;
  @Input() label?: string;
  @Input() labelStyle: 'micro' | 'normal' = 'micro';
  @Input() placeholder = 'Select an option...';
  @Input() searchPlaceholder = 'Search...';
  @Input() emptyMessage = 'No options found';
  @Input() required = false;
  @Input() disabled = false;
  @Input() searchable = true;
  @Input() allowClear = true;

  @Output() valueChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<ComboboxOption | null>();

  isOpen = signal(false);
  searchQuery = signal('');

  selectedOption = computed(() => {
    return this.options.find((o) => o.value === this.value) || null;
  });

  filteredOptions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.options;
    return this.options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.subtext && o.subtext.toLowerCase().includes(q))
    );
  });

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleOpen(): void {
    if (!this.disabled) {
      this.isOpen.update((v) => !v);
      this.searchQuery.set('');
    }
  }

  selectOption(opt: ComboboxOption): void {
    this.value = opt.value;
    this.valueChange.emit(this.value);
    this.selectionChange.emit(opt);
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  clearSelection(event: MouseEvent): void {
    event.stopPropagation();
    this.value = null;
    this.valueChange.emit(null);
    this.selectionChange.emit(null);
    this.searchQuery.set('');
  }
}
