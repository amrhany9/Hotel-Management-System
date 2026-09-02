export interface TopRoomReport {
  roomNumber: string;
  roomType: string;
  reservationCount: number;
  totalRevenue: number;
}

export interface RoomTypeRevenue {
  roomType: string;
  reservationCount: number;
  totalNights: number;
  totalRevenue: number;
}

export interface RevenueReport {
  totalReservations: number;
  totalNights: number;
  totalRevenue: number;
  byRoomType: RoomTypeRevenue[];
}

export interface OccupancyReportItem {
  roomNumber: string;
  roomType: string;
  bookedNights: number;
  availableNights: number;
  occupancyPercentage: number;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  confirmedReservations: number;
  cancelledReservations: number;
  occupancyPercentage: number;
}
