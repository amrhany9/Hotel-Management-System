import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IMediator } from '../../application/common/mediator/mediator';
import { DashboardStatsDto } from '../../application/dtos/reports/dashboard-stats.dto';
import { OccupancyReportItemDto } from '../../application/dtos/reports/occupancy-report-item.dto';
import { RevenueReportDto } from '../../application/dtos/reports/revenue-report.dto';
import { TopRoomReportDto } from '../../application/dtos/reports/top-room-report.dto';
import { GetDashboardStatsQuery } from '../../application/queries/reports/get-dashboard-stats.query';
import { GetOccupancyReportQuery } from '../../application/queries/reports/get-occupancy-report.query';
import { GetRevenueReportQuery } from '../../application/queries/reports/get-revenue-report.query';
import { GetTopRoomsReportQuery } from '../../application/queries/reports/get-top-rooms-report.query';
import type { DateOnly } from '../../domain/common/date-only';
import { OptionalDateOnlyPipe, OptionalIntPipe } from '../binding/query-parameter.pipes';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly mediator: IMediator) {}

  @Get('top-rooms')
  getTopRooms(@Query('take', OptionalIntPipe) take?: number): Promise<TopRoomReportDto[]> {
    return this.mediator.send(new GetTopRoomsReportQuery(take ?? 5));
  }

  @Get('revenue')
  getRevenue(
    @Query('from', OptionalDateOnlyPipe) from: DateOnly,
    @Query('to', OptionalDateOnlyPipe) to: DateOnly,
  ): Promise<RevenueReportDto> {
    return this.mediator.send(new GetRevenueReportQuery(from, to));
  }

  @Get('occupancy')
  getOccupancy(
    @Query('from', OptionalDateOnlyPipe) from: DateOnly,
    @Query('to', OptionalDateOnlyPipe) to: DateOnly,
  ): Promise<OccupancyReportItemDto[]> {
    return this.mediator.send(new GetOccupancyReportQuery(from, to));
  }

  @Get('dashboard')
  getDashboardStats(): Promise<DashboardStatsDto> {
    return this.mediator.send(new GetDashboardStatsQuery());
  }
}
