import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RoomService } from '../../core/services/api.services';
import { SignalRService } from '../../core/services/signalr.service';
import { NotificationService } from '../../core/services/notification.service';
import { Room, CreateRoomRequest, UpdateRoomRequest } from '../../core/models/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
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
    { label: 'Single', value: 'Single', subtext: '1 King or Queen bed' },
    { label: 'Double', value: 'Double', subtext: '2 Double beds' },
    { label: 'Suite', value: 'Suite', subtext: 'Master suite with living room' },
    { label: 'Deluxe', value: 'Deluxe', subtext: 'Luxury suite with balcony' },
  ];

  get activeFilterCount(): number {
    let count = 0;
    if (this.filterType) count++;
    if (this.filterCheckIn) count++;
    if (this.filterCheckOut) count++;
    if (this.filterMaxPrice) count++;
    return count;
  }

  getRoomTypeVariant(type: string): 'info' | 'success' | 'warning' | 'neutral' {
    switch (type.toLowerCase()) {
      case 'suite':
        return 'info';
      case 'deluxe':
        return 'success';
      case 'double':
        return 'warning';
      default:
        return 'neutral';
    }
  }

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
        this.notificationService.error('Failed to load rooms');
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
            this.notificationService.error(err.error?.detail || 'Date availability check failed');
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
      this.notificationService.warning('Please enter valid room details');
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
          this.notificationService.success(`Room ${updateData.roomNumber} updated`);
          this.closeModal();
          this.loadRooms();
        },
        error: (err) => {
          this.saving.set(false);
          this.notificationService.error(err.error?.detail || 'Failed to update room');
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
          this.notificationService.success(`Room ${created.roomNumber} created`);
          this.closeModal();
          this.loadRooms();
        },
        error: (err) => {
          this.saving.set(false);
          this.notificationService.error(err.error?.detail || 'Failed to create room');
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
        this.notificationService.success(`Room ${this.roomToDelete?.roomNumber} deleted`);
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
