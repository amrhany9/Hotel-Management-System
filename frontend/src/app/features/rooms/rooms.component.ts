import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RoomService } from '../../core/services/api.services';
import { SignalRService } from '../../core/services/signalr.service';
import { NotificationService } from '../../core/services/notification.service';
import { Room, CreateRoomRequest, UpdateRoomRequest } from '../../core/models/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { roomTypeVariant } from '../../shared/room-type';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import {
  UiButtonComponent,
  UiCardComponent,
  UiBadgeComponent,
  UiModalComponent,
  UiInputComponent,
  UiComboboxComponent,
  ComboboxOption,
} from '../../shared/components/ui';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    MoneyPipe,
    UiButtonComponent,
    UiCardComponent,
    UiBadgeComponent,
    UiModalComponent,
    UiInputComponent,
    UiComboboxComponent,
  ],
  templateUrl: './rooms.component.html',
})
export class RoomsComponent implements OnInit, OnDestroy {
  private roomService = inject(RoomService);
  private signalRService = inject(SignalRService);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService);
  private translation = inject(TranslationService);

  private t(key: string, params?: Record<string, string | number>): string {
    return this.translation.translate(key, params);
  }

  rooms = signal<Room[]>([]);
  filteredRooms = signal<Room[]>([]);
  saving = signal(false);
  deleting = signal(false);

  // Filters
  filterType: any = null;
  filterCheckIn = '';
  filterCheckOut = '';
  filterMaxPrice: any = null;

  // Modals
  isModalOpen = false;
  isDeleteModalOpen = false;
  editingRoomId: number | null = null;
  roomToDelete: Room | null = null;

  modalRoomNumber = '';
  modalRoomType = 'Single';
  modalPrice = 100;
  modalIsAvailable = true;

  roomTypeOptions: ComboboxOption[] = [
    { label: 'Standard', value: 'Standard', subtext: 'Queen bed, city view' },
    { label: 'Deluxe', value: 'Deluxe', subtext: 'King bed, Nile view' },
    { label: 'Junior Suite', value: 'Junior Suite', subtext: 'Bedroom with sitting area' },
    { label: 'Family Suite', value: 'Family Suite', subtext: 'Two bedrooms, sleeps four' },
    { label: 'Presidential Suite', value: 'Presidential Suite', subtext: 'Top floor, private terrace' },
  ];

  get activeFilterCount(): number {
    let count = 0;
    if (this.filterType) count++;
    if (this.filterCheckIn) count++;
    if (this.filterCheckOut) count++;
    if (this.filterMaxPrice) count++;
    return count;
  }

  readonly getRoomTypeVariant = roomTypeVariant;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.loadRooms();

    this.subs.push(
      this.signalRService.roomCreated$.subscribe(() => this.loadRooms()),
      this.signalRService.roomUpdated$.subscribe(() => this.loadRooms()),
      this.signalRService.roomDeleted$.subscribe(() => this.loadRooms())
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (list) => {
        this.rooms.set(list);
        this.applyFilters();
      },
      error: (err) => {
        this.notificationService.error(this.t('toast.loadFailed'));
      },
    });
  }

  applyFilters(): void {
    if (this.filterCheckIn && this.filterCheckOut) {
      this.roomService
        .getAvailableRooms({
          roomType: this.filterType || undefined,
          checkIn: this.filterCheckIn,
          checkOut: this.filterCheckOut,
          maxPrice: this.filterMaxPrice ? Number(this.filterMaxPrice) : undefined,
        })
        .subscribe({
          next: (available) => this.filteredRooms.set(available),
          error: (err) => {
            this.notificationService.error(err.error?.detail || this.t('toast.genericError'));
          },
        });
    } else {
      let result = this.rooms();
      if (this.filterType) {
        result = result.filter((r) => r.roomType.toLowerCase() === this.filterType.toLowerCase());
      }
      if (this.filterMaxPrice) {
        result = result.filter((r) => r.pricePerNight <= Number(this.filterMaxPrice));
      }
      this.filteredRooms.set(result);
    }
  }

  resetFilters(): void {
    this.filterType = null;
    this.filterCheckIn = '';
    this.filterCheckOut = '';
    this.filterMaxPrice = null;
    this.filteredRooms.set(this.rooms());
  }

  openCreateModal(): void {
    this.editingRoomId = null;
    this.modalRoomNumber = '';
    this.modalRoomType = 'Single';
    this.modalPrice = 100;
    this.modalIsAvailable = true;
    this.isModalOpen = true;
  }

  openEditModal(room: Room): void {
    this.editingRoomId = room.id;
    this.modalRoomNumber = room.roomNumber;
    this.modalRoomType = room.roomType;
    this.modalPrice = room.pricePerNight;
    this.modalIsAvailable = room.isAvailable;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveRoom(): void {
    if (!this.modalRoomNumber || !this.modalRoomType || this.modalPrice <= 0) {
      this.notificationService.warning(this.t('toast.completeFields'));
      return;
    }

    this.saving.set(true);

    if (this.editingRoomId) {
      const updateData: UpdateRoomRequest = {
        id: this.editingRoomId,
        roomNumber: this.modalRoomNumber,
        roomType: this.modalRoomType,
        pricePerNight: Number(this.modalPrice),
        isAvailable: this.modalIsAvailable,
      };

      this.roomService.updateRoom(this.editingRoomId, updateData).subscribe({
        next: () => {
          this.saving.set(false);
          this.notificationService.success(this.t('toast.roomUpdated', { room: updateData.roomNumber }));
          this.closeModal();
          this.loadRooms();
        },
        error: (err) => {
          this.saving.set(false);
          this.notificationService.error(err.error?.detail || this.t('toast.genericError'));
        },
      });
    } else {
      const createData: CreateRoomRequest = {
        roomNumber: this.modalRoomNumber,
        roomType: this.modalRoomType,
        pricePerNight: Number(this.modalPrice),
        isAvailable: this.modalIsAvailable,
      };

      this.roomService.createRoom(createData).subscribe({
        next: (created) => {
          this.saving.set(false);
          this.notificationService.success(this.t('toast.roomCreated', { room: created.roomNumber }));
          this.closeModal();
          this.loadRooms();
        },
        error: (err) => {
          this.saving.set(false);
          this.notificationService.error(err.error?.detail || this.t('toast.genericError'));
        },
      });
    }
  }

  confirmDelete(room: Room): void {
    this.roomToDelete = room;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.roomToDelete = null;
  }

  executeDelete(): void {
    if (!this.roomToDelete) return;

    this.deleting.set(true);
    this.roomService.deleteRoom(this.roomToDelete.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.notificationService.success(this.t('toast.roomDeleted', { room: this.roomToDelete?.roomNumber ?? '' }));
        this.closeDeleteModal();
        this.loadRooms();
      },
      error: (err) => {
        this.deleting.set(false);
        const msg = err.error?.detail || 'Cannot delete room with active reservations';
        this.notificationService.error(msg);
      },
    });
  }
}
