import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  signal,
  computed,
  viewChild,
  afterRenderEffect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';

export interface ComboboxOption {
  label: string;
  value: any;
  subtext?: string;
  badge?: string;
}

const PANEL_GAP = 8;
const VIEWPORT_MARGIN = 8;

@Component({
  selector: 'ui-combobox',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './ui-combobox.component.html',
  host: { class: 'block w-full' },
})
export class UiComboboxComponent {
  @Input() set options(options: ComboboxOption[]) {
    this.optionsState.set(options ?? []);
  }
  get options(): ComboboxOption[] {
    return this.optionsState();
  }

  @Input() set value(value: any) {
    this.valueState.set(value);
  }
  get value(): any {
    return this.valueState();
  }

  @Input() label?: string;
  @Input() labelStyle: 'micro' | 'normal' = 'micro';
  @Input() placeholder = '';
  @Input() searchPlaceholder = '';
  @Input() emptyMessage = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() searchable = true;
  @Input() allowClear = true;

  @Output() valueChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<ComboboxOption | null>();

  isOpen = signal(false);
  searchQuery = signal('');

  private optionsState = signal<ComboboxOption[]>([]);
  private valueState = signal<any>(null);

  private trigger = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private panel = viewChild<ElementRef<HTMLElement>>('panel');

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

  constructor(private elementRef: ElementRef) {
    afterRenderEffect((onCleanup) => {
      const panel = this.panel()?.nativeElement;
      this.filteredOptions();
      if (!panel) return;

      if (panel.parentElement !== document.body) {
        document.body.appendChild(panel);
      }

      const reposition = () => this.positionPanel(panel);
      reposition();
      window.addEventListener('scroll', reposition, true);
      window.addEventListener('resize', reposition);
      onCleanup(() => {
        window.removeEventListener('scroll', reposition, true);
        window.removeEventListener('resize', reposition);
      });
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    const insidePanel = this.panel()?.nativeElement.contains(target) ?? false;
    if (!this.elementRef.nativeElement.contains(target) && !insidePanel) {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen.set(false);
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

  private positionPanel(panel: HTMLElement): void {
    const rect = this.trigger().nativeElement.getBoundingClientRect();
    const height = panel.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - PANEL_GAP - VIEWPORT_MARGIN;
    const openUpward = height > spaceBelow && spaceAbove > spaceBelow;

    const top = openUpward
      ? Math.max(VIEWPORT_MARGIN, rect.top - PANEL_GAP - height)
      : rect.bottom + PANEL_GAP;

    panel.style.left = `${rect.left}px`;
    panel.style.width = `${rect.width}px`;
    panel.style.top = `${top}px`;
    panel.style.visibility = 'visible';
  }
}
