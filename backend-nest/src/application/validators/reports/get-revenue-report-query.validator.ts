import { GetRevenueReportQuery } from '../../queries/reports/get-revenue-report.query';
import { IsDateOnly, IsDateOnlyAfter } from '../../common/validation/custom.validators';
import { ValidatorFor } from '../../common/validation/validator-for.decorator';

@ValidatorFor(GetRevenueReportQuery)
export class GetRevenueReportQueryValidator {
  @IsDateOnly({ message: 'From date is required.' })
  from: string;

  @IsDateOnly({ message: 'To date is required.' })
  @IsDateOnlyAfter('from', { message: 'To date must be after From date.' })
  to: string;
}
