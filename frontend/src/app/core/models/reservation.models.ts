export type ReservationStatus = 'Confirmed' | 'CheckedIn' | 'CheckedOut' | 'Cancelled' | 'NoShow';
export type PaymentMethod = 'Cash' | 'Card' | 'BankTransfer';

export interface Reservation {
  id: number;
  roomId: number;
  roomNumber: string;
  roomType: string;
  guestId: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string | null;
  guestIdNumber?: string | null;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  nightlyRate: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: ReservationStatus;
  notes?: string | null;
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  createdBy: number;
  createdByName: string;
  createdAt: string;
}

export interface Payment {
  id: number;
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  paidAt: string;
  receivedBy: number;
  receivedByName: string;
}

export interface ReservationDetail extends Reservation {
  invoiceNumber: string;
  payments: Payment[];
}

export interface CreateReservationRequest {
  roomId: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string | null;
  guestIdNumber?: string | null;
  checkInDate: string;
  checkOutDate: string;
  notes?: string | null;
}

export interface RecordPaymentRequest {
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
}

export interface ReservationUpdatedEvent {
  action: string;
  reservation: Reservation;
}
