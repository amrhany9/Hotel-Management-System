import { GetOccupancyReportQuery } from '../../queries/reports/get-occupancy-report.query';
import { IsDateOnly, IsDateOnlyAfter } from '../../common/validation/custom.validators';
import { ValidatorFor } from '../../common/validation/validator-for.decorator';

@ValidatorFor(GetOccupancyReportQuery)
export class GetOccupancyReportQueryValidator {
  @IsDateOnly({ message: 'From date is required.' })
  from: string;

  @IsDateOnly({ message: 'To date is required.' })
  @IsDateOnlyAfter('from', { message: 'To date must be after From date.' })
  to: string;
}
