import { IsInt, IsNotEmpty, IsString, IsOptional, IsPositive } from 'class-validator';

export class CreatePaymentLinkDto {
  @IsInt()
  invoiceId!: number;

  @IsPositive()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
