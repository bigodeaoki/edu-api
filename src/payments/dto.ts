import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { IsDocumento } from '../common/decorators/is-documento.decorator';

export class ParteDivisaoDto {
  @IsNumber()
  @Min(0)
  valor!: number;

  @IsNumber()
  @Min(0)
  entrada!: number;

  @IsInt()
  @Min(1)
  @Max(60)
  qtdParcelas!: number;

  @IsInt()
  @Min(1)
  @Max(365)
  diasEntreParcelas!: number;

  @IsDateString()
  primeiroVencimento!: string;
}

/** Sub-DTO para criar cliente novo dentro de POST /payments. */
export class NovoClienteDto {
  @IsString()
  @MinLength(2)
  nome!: string;

  @IsDocumento()
  documento!: string;
}

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  userId?: string;

  /** Apelido opcional para identificar o pagamento nas listas. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  apelido?: string;

  /**
   * Cliente existente (selecionado no autocomplete).
   * Mutuamente exclusivo com `cliente` (novo).
   */
  @ValidateIf((o: CreatePaymentDto) => !o.cliente)
  @IsString()
  clienteId?: string;

  /**
   * Cliente novo (não selecionou da lista).
   * Mutuamente exclusivo com `clienteId`.
   */
  @ValidateIf((o: CreatePaymentDto) => !o.clienteId)
  @ValidateNested()
  @Type(() => NovoClienteDto)
  cliente?: NovoClienteDto;

  @IsNumber()
  @Min(0.01)
  valorTotal!: number;

  @ValidateNested()
  @Type(() => ParteDivisaoDto)
  parteA!: ParteDivisaoDto;

  @ValidateNested()
  @Type(() => ParteDivisaoDto)
  parteB!: ParteDivisaoDto;
}
