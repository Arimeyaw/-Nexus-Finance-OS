import { IsNotEmpty, IsString } from 'class-validator';

export class RunPayrollDto {
  @IsString()
  @IsNotEmpty()
  period!: string;
}
