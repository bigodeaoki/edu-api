import {
  IsEmail,
  IsIn,
  IsNumber,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import type { Role } from '../common/types';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  nome!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(4)
  senha!: string;

  @IsIn(['owner', 'user'])
  role!: Role;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentualComissao!: number;
}
