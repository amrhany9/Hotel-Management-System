export interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  isAvailable: boolean;
  createdAt: string;
}

export interface CreateRoomRequest {
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  isAvailable?: boolean;
}

export interface UpdateRoomRequest {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  isAvailable: boolean;
}

export interface AvailableRoomsQuery {
  roomType?: string;
  checkIn: string;
  checkOut: string;
  maxPrice?: number;
}
