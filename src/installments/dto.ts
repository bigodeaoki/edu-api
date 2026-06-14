import { IsIn, IsOptional } from 'class-validator';
import type { ParcelaStatus } from '../common/types';

export class UpdateStatusDto {
  @IsIn(['pendente', 'pago', 'vencido'])
  status!: ParcelaStatus;
}

export class ListQueryDto {
  @IsOptional()
  @IsIn(['pendente', 'pago', 'vencido'])
  status?: ParcelaStatus;
}
