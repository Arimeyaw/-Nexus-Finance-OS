import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateSalaryStructureDto {
  @IsNumber()
  employeeId!: number;

  @IsPositive()
  baseSalary!: number;

  @IsPositive()
  @IsOptional()
  bonus?: number;

  @IsPositive()
  @IsOptional()
  allowances?: number;

  @IsPositive()
  @IsOptional()
  deductions?: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsDateString()
  effectiveFrom!: string;

  @IsDateString()
  @IsOptional()
  effectiveTo?: string;
}
