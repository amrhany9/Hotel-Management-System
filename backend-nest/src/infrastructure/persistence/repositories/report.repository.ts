import { Injectable } from '@nestjs/common';
import { IReportRepository } from '../../../application/common/interfaces/repositories/report.repository';
import { roundMoney } from '../../../application/common/utils/money';
import { DashboardStatsDto } from '../../../application/dtos/reports/dashboard-stats.dto';
import { OccupancyReportItemDto } from '../../../application/dtos/reports/occupancy-report-item.dto';
import { RevenueReportDto } from '../../../application/dtos/reports/revenue-report.dto';
import { RoomTypeRevenueDto } from '../../../application/dtos/reports/room-type-revenue.dto';
import { TopRoomReportDto } from '../../../application/dtos/reports/top-room-report.dto';
import { daysBetween, monthRange, nightsInRange, todayUtc, type DateOnly } from '../../../domain/common/date-only';
import { Reservation } from '../../../domain/entities/reservation';
import { Room } from '../../../domain/entities/room';
import { ReservationStatus } from '../../../domain/enums/reservation-status';
import { UnitOfWork } from './unit-of-work';

const roundPercent = (value: number): number => Math.round(value * 10) / 10;

@Injectable()
export class ReportRepository implements IReportRepository {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  private get rooms() {
    return this.unitOfWork.manager.getRepository(Room);
  }

  private get reservations() {
    return this.unitOfWork.manager.getRepository(Reservation);
  }

  async getTopRooms(take: number): Promise<TopRoomReportDto[]> {
    const limit = take > 0 ? take : 5;

    const rows = await this.rooms
      .createQueryBuilder('room')
      .leftJoin('room.reservations', 'res', 'res.status <> :cancelled', { cancelled: ReservationStatus.Cancelled })
      .select('room.roomNumber', 'roomNumber')
      .addSelect('room.roomType', 'roomType')
      .addSelect('COUNT(res.id)', 'reservationCount')
      .addSelect('COALESCE(SUM(res.totalAmount), 0)', 'totalRevenue')
      .groupBy('room.id')
      .addGroupBy('room.roomNumber')
      .addGroupBy('room.roomType')
      .orderBy('reservationCount', 'DESC')
      .addOrderBy('totalRevenue', 'DESC')
      .addOrderBy('roomNumber', 'ASC')
      .limit(limit)
      .getRawMany<{ roomNumber: string; roomType: string; reservationCount: number | string; totalRevenue: number | string }>();

    return rows.map((row) => ({
      roomNumber: row.roomNumber,
      roomType: row.roomType,
      reservationCount: Number(row.reservationCount),
      totalRevenue: Number(row.totalRevenue),
    }));
  }

  async getRevenueReport(from: DateOnly, to: DateOnly): Promise<RevenueReportDto> {
    const reservations = await this.getActiveReservationsInRange(from, to);

    const groups = new Map<string, RoomTypeRevenueDto>();
    for (const r of reservations) {
      const roomType = r.room?.roomType ?? '';
      const group = groups.get(roomType) ?? { roomType, reservationCount: 0, totalNights: 0, totalRevenue: 0 };

      const fullNights = Math.max(1, daysBetween(r.checkInDate, r.checkOutDate));
      const nights = nightsInRange(r.checkInDate, r.checkOutDate, from, to);
      group.reservationCount += 1;
      group.totalNights += nights;
      group.totalRevenue += (r.totalAmount / fullNights) * nights;
      groups.set(roomType, group);
    }

    const byRoomType = [...groups.values()]
      .map((group) => ({ ...group, totalRevenue: roundMoney(group.totalRevenue) }))
      .sort((a, b) => a.roomType.localeCompare(b.roomType));

    return {
      totalReservations: reservations.length,
      totalNights: byRoomType.reduce((sum, g) => sum + g.totalNights, 0),
      totalRevenue: roundMoney(byRoomType.reduce((sum, g) => sum + g.totalRevenue, 0)),
      byRoomType,
    };
  }

  async getOccupancyReport(from: DateOnly, to: DateOnly): Promise<OccupancyReportItemDto[]> {
    const availableNightsInRange = daysBetween(from, to);
    const rooms = await this.rooms.find({ order: { roomNumber: 'ASC' } });
    const reservations = await this.getActiveReservationsInRange(from, to);

    const bookedByRoom = new Map<number, number>();
    for (const r of reservations) {
      bookedByRoom.set(r.roomId, (bookedByRoom.get(r.roomId) ?? 0) + nightsInRange(r.checkInDate, r.checkOutDate, from, to));
    }

    return rooms.map((room) => {
      const bookedNights = Math.min(bookedByRoom.get(room.id) ?? 0, availableNightsInRange);
      return {
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        bookedNights,
        availableNights: availableNightsInRange,
        occupancyPercentage:
          availableNightsInRange > 0 ? roundPercent((bookedNights / availableNightsInRange) * 100) : 0,
      };
    });
  }

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const totalRooms = await this.rooms.count();
    const availableRooms = await this.rooms.countBy({ isAvailable: true });
    const confirmed = await this.reservations.countBy({ status: ReservationStatus.Confirmed });
    const cancelled = await this.reservations.countBy({ status: ReservationStatus.Cancelled });

    const { start: monthStart, end: monthEnd } = monthRange(todayUtc());
    const daysInMonth = daysBetween(monthStart, monthEnd);

    let occupancyRate = 0;
    if (totalRooms > 0 && daysInMonth > 0) {
      const activeRes = await this.reservations
        .createQueryBuilder('r')
        .where('r.status = :confirmed', { confirmed: ReservationStatus.Confirmed })
        .andWhere('r.checkInDate < :monthEnd', { monthEnd })
        .andWhere('r.checkOutDate > :monthStart', { monthStart })
        .getMany();

      const bookedNights = activeRes.reduce(
        (sum, r) => sum + nightsInRange(r.checkInDate, r.checkOutDate, monthStart, monthEnd),
        0,
      );
      occupancyRate = roundPercent((bookedNights / (totalRooms * daysInMonth)) * 100);
    }

    return {
      totalRooms,
      availableRooms,
      confirmedReservations: confirmed,
      cancelledReservations: cancelled,
      occupancyPercentage: occupancyRate,
    };
  }

  private getActiveReservationsInRange(from: DateOnly, to: DateOnly): Promise<Reservation[]> {
    return this.reservations
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.room', 'room')
      .where('r.status <> :cancelled', { cancelled: ReservationStatus.Cancelled })
      .andWhere('r.checkInDate < :to', { to })
      .andWhere('r.checkOutDate > :from', { from })
      .getMany();
  }
}
