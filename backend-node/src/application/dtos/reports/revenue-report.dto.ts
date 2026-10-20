import { RoomTypeRevenueDto } from './room-type-revenue.dto';

export class RevenueReportDto {
  totalReservations: number;
  totalNights: number;
  totalRevenue: number;
  byRoomType: RoomTypeRevenueDto[];
}
