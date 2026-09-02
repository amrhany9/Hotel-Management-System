export interface Reservation {
  id: number;
  roomId: number;
  roomNumber: string;
  roomType: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalAmount: number;
  status: 'Confirmed' | 'Cancelled' | string;
  createdBy: number;
  createdByName: string;
  createdAt: string;
}

export interface CreateReservationRequest {
  roomId: number;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
}
